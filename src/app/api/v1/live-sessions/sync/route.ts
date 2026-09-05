import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';

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
    const questionTime = session.questionTime || 30;
    const now = Date.now();

    // Auto question progression for Conduct Quiz sessions
    if (
      session.sessionType === 'CONDUCT' &&
      session.stage === 'QUESTION_ACTIVE' &&
      session.questionStartTimestamp
    ) {
      const elapsedSeconds = (now - session.questionStartTimestamp) / 1000;
      // Allow questionTime + 2 seconds transition
      if (elapsedSeconds >= questionTime + 2) {
        if (session.currentQuestionIndex < totalQuestions - 1) {
          session.currentQuestionIndex = session.currentQuestionIndex + 1;
          session.questionStartTimestamp = Date.now();
          session.markModified('currentQuestionIndex');
          session.markModified('questionStartTimestamp');
          await session.save();
        } else {
          session.stage = 'FINAL_SCOREBOARD';
          session.closedAt = new Date();
          session.markModified('stage');
          session.markModified('closedAt');
          await session.save();
        }
      }
    }

    // Build question stats for current question
    const qIdx = session.currentQuestionIndex;
    const currentQ = questions[qIdx] || null;
    const answersForQ = (session.answers && session.answers[qIdx]) || {};

    const participantList = Object.values(session.participants || {}).sort(
      (a: any, b: any) => (b.score || 0) - (a.score || 0)
    );

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

    // Sanitize question for student if question is active
    let sanitizedQuestion = currentQ ? { ...currentQ } : null;
    if (role === 'student' && session.stage === 'QUESTION_ACTIVE') {
      if (sanitizedQuestion) {
        // Omit correctOptionIndex & explanation during active answering
        const { correctOptionIndex, explanation, ...rest } = sanitizedQuestion;
        sanitizedQuestion = rest as any;
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
          questionTime,
          pointsMode: session.pointsMode,
          stage: session.stage,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions,
          questionStartTimestamp: session.questionStartTimestamp,
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
