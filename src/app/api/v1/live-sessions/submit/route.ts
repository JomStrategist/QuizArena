import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { calculateQuestionScore } from '@/lib/game/scoringEngine';
import { emitSessionEvent } from '@/lib/game/liveSyncStream';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      quizCode,
      participantId,
      displayName,
      questionIndex,
      selectedOptionIndex,
      responseTimeMs = 1000,
    } = body;

    if (!quizCode || (!participantId && !displayName) || questionIndex === undefined || selectedOptionIndex === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing required submission fields.' } },
        { status: 400 }
      );
    }

    const session = await LiveSessionModel.findOne({
      quizCode: quizCode.toString().trim(),
      stage: { $ne: 'CLOSED' },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Active session not found.' } },
        { status: 404 }
      );
    }

    const participants = session.participants || {};

    // Target participant key
    let pKey = participantId;
    if (!pKey || !participants[pKey]) {
      const foundKey = Object.keys(participants).find(
        (k) => participants[k].displayName === displayName
      );
      if (foundKey) {
        pKey = foundKey;
      }
    }

    if (!pKey || !participants[pKey]) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You have not joined this active quiz session. Please join first.',
          },
        },
        { status: 403 }
      );
    }

    const targetParticipant = participants[pKey];

    const qIdx = Number(questionIndex);
    const questions = session.quizSnapshot?.questions || [];
    const question = questions[qIdx];

    if (!question) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_QUESTION', message: 'Question index out of range.' } },
        { status: 400 }
      );
    }

    // Question-specific configured time limit
    const timeLimit = question.timeLimit || session.questionTime || 20;

    // Server-authoritative response time and deadline validation
    const serverNow = Date.now();
    let actualResponseTimeMs = responseTimeMs;
    if (session.questionStartTimestamp) {
      const serverElapsedMs = Math.max(0, serverNow - session.questionStartTimestamp);
      // Use server elapsed time as authoritative if client time deviates significantly
      actualResponseTimeMs = Math.min(serverElapsedMs, Math.max(100, responseTimeMs));

      if (serverElapsedMs > (timeLimit + 2) * 1000) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'TIME_EXPIRED', message: 'Question time limit has expired. Answer rejected.' },
            data: { pointsEarned: 0, isCorrect: false },
          },
          { status: 400 }
        );
      }
    }

    // Initialize answers structure
    const answers = session.answers || {};
    if (!answers[qIdx]) {
      answers[qIdx] = {};
    }

    // Prevent duplicate submission for same question
    if (answers[qIdx][pKey]) {
      const existing = answers[qIdx][pKey];
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Duplicate submission ignored. Returning existing response.',
      });
    }

    const isCorrect = selectedOptionIndex >= 0 && selectedOptionIndex === question.correctOptionIndex;
    const isTimeout = selectedOptionIndex === -1;
    const maxPts = question.points || 1000;

    let pointsEarned = 0;
    if (isCorrect && !isTimeout) {
      if (session.speedScoring !== false) {
        pointsEarned = calculateQuestionScore({
          isCorrect: true,
          maxPoints: maxPts,
          timeLimitSeconds: timeLimit, // Question-specific time limit
          responseTimeMs: actualResponseTimeMs,
        });
      } else {
        pointsEarned = maxPts;
      }
    }

    const responseRecord = {
      participantId: pKey,
      displayName: targetParticipant.displayName || displayName,
      questionIndex: qIdx,
      selectedOptionIndex,
      isCorrect,
      isTimeout,
      pointsEarned,
      responseTimeMs: actualResponseTimeMs,
      timestamp: serverNow,
    };

    answers[qIdx][pKey] = responseRecord;
    session.answers = answers;
    session.markModified('answers');

    // Update participant aggregate stats
    targetParticipant.score = (targetParticipant.score || 0) + pointsEarned;
    if (isCorrect) {
      targetParticipant.correctAnswers = (targetParticipant.correctAnswers || 0) + 1;
    } else if (isTimeout) {
      targetParticipant.unansweredCount = (targetParticipant.unansweredCount || 0) + 1;
    } else {
      targetParticipant.wrongAnswers = (targetParticipant.wrongAnswers || 0) + 1;
    }
    targetParticipant.lastPointsEarned = pointsEarned;
    targetParticipant.lastIsCorrect = isCorrect;
    targetParticipant.lastResponseTimeMs = actualResponseTimeMs;
    participants[pKey] = targetParticipant;

    // Recalculate participant ranks and compute rank delta
    const sortedList = Object.values(participants).sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    sortedList.forEach((item: any, rankIdx: number) => {
      const k = item.participantId || item.displayName;
      if (participants[k]) {
        const oldRank = participants[k].rank || (rankIdx + 1);
        const newRank = rankIdx + 1;
        participants[k].previousRank = oldRank;
        participants[k].rank = newRank;
        participants[k].lastRankDelta = oldRank - newRank; // Positive means moved up, negative means fell down
      }
    });

    session.participants = participants;
    session.markModified('participants');
    await session.save();

    // Broadcast ANSWER_SUBMITTED event
    emitSessionEvent(session.quizCode, 'ANSWER_SUBMITTED', {
      participantId: pKey,
      questionIndex: qIdx,
      answeredCount: Object.keys(answers[qIdx]).length,
      totalParticipants: Object.keys(participants).length,
    });

    return NextResponse.json({
      success: true,
      data: responseRecord,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
