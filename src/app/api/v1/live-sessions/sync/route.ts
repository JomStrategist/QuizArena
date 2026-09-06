import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { emitSessionEvent } from '@/lib/game/liveSyncStream';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const quizCode = searchParams.get('code');
    const participantId = searchParams.get('participantId');
    const displayName = searchParams.get('displayName');
    const role = searchParams.get('role'); // 'trainer' | 'student'

    if (!quizCode) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz code is required.' } },
        { status: 400 }
      );
    }

    const session = await LiveSessionModel.findOne({
      quizCode: quizCode.toString().trim(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Session not found.' } },
        { status: 404 }
      );
    }

    const questions = session.quizSnapshot?.questions || [];
    const totalQuestions = questions.length;
    const qIdx = session.currentQuestionIndex || 0;
    const currentQ = questions[qIdx] || null;

    // QUESTION-SPECIFIC TIME LIMIT ENFORCEMENT
    // Each question has its own configured time limit (e.g. 30s, 15s, 60s, etc.)
    const questionTime = currentQ?.timeLimit || session.questionTime || 20;
    const now = Date.now();

    // Synchronized State Machine Auto Progression
    if (session.stage !== 'PAUSED' && session.stage !== 'CLOSED' && session.stage !== 'LOBBY') {
      if (session.stage === 'STARTING' && session.stageStartTimestamp) {
        const countdownElapsed = (now - session.stageStartTimestamp) / 1000;
        if (countdownElapsed >= 3) {
          session.stage = 'QUESTION_ACTIVE';
          session.questionStartTimestamp = Date.now();
          session.markModified('stage');
          session.markModified('questionStartTimestamp');
          await session.save();
          emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: 'QUESTION_ACTIVE', questionIndex: qIdx });
        }
      } else if (session.stage === 'QUESTION_ACTIVE' && session.questionStartTimestamp) {
        const elapsedSeconds = (now - session.questionStartTimestamp) / 1000;
        if (elapsedSeconds >= questionTime) {
          session.stage = 'SHOWING_RESULT';
          session.stageStartTimestamp = Date.now();
          session.markModified('stage');
          session.markModified('stageStartTimestamp');
          await session.save();
          emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: 'SHOWING_RESULT', questionIndex: qIdx });
        }
      } else if (session.stage === 'SHOWING_RESULT' && session.stageStartTimestamp) {
        const elapsedResult = (now - session.stageStartTimestamp) / 1000;
        const resultDelay = 3; // 3 seconds result reveal
        if (elapsedResult >= resultDelay) {
          const showLeaderboard = session.showLeaderboard !== false;
          if (showLeaderboard) {
            session.stage = 'LEADERBOARD';
            session.stageStartTimestamp = Date.now();
            session.markModified('stage');
            session.markModified('stageStartTimestamp');
            await session.save();
            emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: 'LEADERBOARD', questionIndex: qIdx });
          } else {
            // Skip leaderboard and advance to next question or end
            if (session.currentQuestionIndex < totalQuestions - 1) {
              session.currentQuestionIndex = session.currentQuestionIndex + 1;
              session.stage = 'QUESTION_ACTIVE';
              session.questionStartTimestamp = Date.now();
              session.markModified('currentQuestionIndex');
              session.markModified('stage');
              session.markModified('questionStartTimestamp');
              await session.save();
              emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: 'QUESTION_ACTIVE', questionIndex: session.currentQuestionIndex });
            } else {
              session.stage = session.finalPodium !== false ? 'FINAL_PODIUM' : 'FINAL_SCOREBOARD';
              session.closedAt = new Date();
              session.markModified('stage');
              session.markModified('closedAt');
              await session.save();
              emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: session.stage });
            }
          }
        }
      } else if (session.stage === 'LEADERBOARD' && session.stageStartTimestamp) {
        const elapsedLeaderboard = (now - session.stageStartTimestamp) / 1000;
        const leaderboardDelay = 5; // 5 seconds leaderboard view
        if (elapsedLeaderboard >= leaderboardDelay) {
          if (session.currentQuestionIndex < totalQuestions - 1) {
            session.currentQuestionIndex = session.currentQuestionIndex + 1;
            session.stage = 'QUESTION_ACTIVE';
            session.questionStartTimestamp = Date.now();
            session.markModified('currentQuestionIndex');
            session.markModified('stage');
            session.markModified('questionStartTimestamp');
            await session.save();
            emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: 'QUESTION_ACTIVE', questionIndex: session.currentQuestionIndex });
          } else {
            session.stage = session.finalPodium !== false ? 'FINAL_PODIUM' : 'FINAL_SCOREBOARD';
            session.closedAt = new Date();
            session.markModified('stage');
            session.markModified('closedAt');
            await session.save();
            emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: session.stage });
          }
        }
      }
    }

    // Build question stats for current question
    const answersForQ = (session.answers && session.answers[qIdx]) || {};

    const participantList = Object.values(session.participants || {}).sort(
      (a: any, b: any) => (b.score || 0) - (a.score || 0)
    );

    // Compute stats for rankings (accuracy %, avg response time, etc.)
    const totalAnsweredAcrossGame = Object.keys(session.answers || {}).length;
    participantList.forEach((p: any, idx: number) => {
      p.rank = idx + 1;
      const totalAttempted = (p.correctAnswers || 0) + (p.wrongAnswers || 0) + (p.unansweredCount || 0);
      p.accuracy = totalAttempted > 0 ? Math.round(((p.correctAnswers || 0) / totalAttempted) * 100) : 0;
      
      // Calculate avg response time across answered questions
      let totalMs = 0;
      let countAns = 0;
      Object.values(session.answers || {}).forEach((qAnswers: any) => {
        const userAns = qAnswers[p.participantId || p.displayName];
        if (userAns && userAns.responseTimeMs) {
          totalMs += userAns.responseTimeMs;
          countAns++;
        }
      });
      p.avgResponseTimeMs = countAns > 0 ? Math.round(totalMs / countAns) : 0;
    });

    const answeredCount = Object.keys(answersForQ).length;
    let correctCount = 0;
    let wrongCount = 0;
    let timeoutCount = 0;

    Object.values(answersForQ).forEach((ans: any) => {
      if (ans.isCorrect) correctCount++;
      else if (ans.isTimeout) timeoutCount++;
      else wrongCount++;
    });

    let studentAnswer = null;
    if (participantId && answersForQ[participantId]) {
      studentAnswer = answersForQ[participantId];
    } else if (displayName && answersForQ[displayName]) {
      studentAnswer = answersForQ[displayName];
    }

    // Ensure current question is a clean plain JavaScript object
    let plainQuestion = currentQ ? JSON.parse(JSON.stringify(currentQ)) : null;
    let sanitizedQuestion = plainQuestion ? { ...plainQuestion } : null;

    if (role === 'student' && session.stage === 'QUESTION_ACTIVE') {
      if (sanitizedQuestion) {
        // Omit correctOptionIndex & explanation during active answering for security
        delete sanitizedQuestion.correctOptionIndex;
        delete sanitizedQuestion.explanation;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        session: {
          _id: session._id,
          quizCode: session.quizCode,
          quizTitle: session.quizTitle,
          trainerName: session.trainerName,
          sessionType: session.sessionType,
          questionTime, // Question-specific time limit
          maxParticipants: session.maxParticipants || 200,
          speedScoring: session.speedScoring !== false,
          showCorrectAnswer: session.showCorrectAnswer !== false,
          showLeaderboard: session.showLeaderboard !== false,
          finalPodium: session.finalPodium !== false,
          pointsMode: session.pointsMode,
          stage: session.stage,
          previousStage: session.previousStage,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions,
          questionStartTimestamp: session.questionStartTimestamp,
          stageStartTimestamp: session.stageStartTimestamp,
          closedAt: session.closedAt,
        },
        currentQuestion: sanitizedQuestion,
        studentAnswer,
        liveStats: {
          totalParticipants: participantList.length,
          answeredCount,
          correctCount,
          wrongCount,
          timeoutCount,
          waitingCount: Math.max(0, participantList.length - answeredCount),
        },
        rankings: participantList,
        serverTime: now,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
