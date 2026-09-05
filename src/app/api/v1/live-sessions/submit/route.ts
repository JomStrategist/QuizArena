import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { calculateQuestionScore } from '@/lib/game/scoringEngine';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      quizCode,
      displayName,
      questionIndex,
      selectedOptionIndex,
      responseTimeMs = 1000,
    } = body;

    if (!quizCode || !displayName || questionIndex === undefined || selectedOptionIndex === undefined) {
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

    const qIdx = Number(questionIndex);
    const questions = session.quizSnapshot?.questions || [];
    const question = questions[qIdx];

    if (!question) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_QUESTION', message: 'Question index out of range.' } },
        { status: 400 }
      );
    }

    const timeLimit = session.questionTime || question.timeLimit || 30;

    // Server-side deadline validation (allow 3 second buffer for latency)
    if (session.questionStartTimestamp) {
      const elapsedMs = Date.now() - session.questionStartTimestamp;
      if (elapsedMs > (timeLimit + 3) * 1000) {
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
    if (answers[qIdx][displayName]) {
      const existing = answers[qIdx][displayName];
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Duplicate submission ignored. Returning existing response.',
      });
    }

    const isCorrect = selectedOptionIndex >= 0 && selectedOptionIndex === question.correctOptionIndex;
    const isTimeout = selectedOptionIndex === -1;

    const pointsEarned = isTimeout || !isCorrect
      ? 0
      : calculateQuestionScore({
          isCorrect: true,
          maxPoints: question.points || 1000,
          timeLimitSeconds: timeLimit,
          responseTimeMs,
        });

    const responseRecord = {
      displayName,
      questionIndex: qIdx,
      selectedOptionIndex,
      isCorrect,
      isTimeout,
      pointsEarned,
      responseTimeMs,
      timestamp: Date.now(),
    };

    answers[qIdx][displayName] = responseRecord;
    session.answers = answers;
    session.markModified('answers');

    // Update participant aggregate stats
    const participants = session.participants || {};
    if (participants[displayName]) {
      const p = participants[displayName];
      p.score = (p.score || 0) + pointsEarned;
      if (isCorrect) {
        p.correctAnswers = (p.correctAnswers || 0) + 1;
      } else if (isTimeout) {
        p.unansweredCount = (p.unansweredCount || 0) + 1;
      } else {
        p.wrongAnswers = (p.wrongAnswers || 0) + 1;
      }
      p.lastPointsEarned = pointsEarned;
      p.lastIsCorrect = isCorrect;
      p.lastResponseTimeMs = responseTimeMs;
      participants[displayName] = p;
    }

    // Recalculate participant ranks
    const sortedList = Object.values(participants).sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    sortedList.forEach((item: any, rankIdx: number) => {
      if (participants[item.displayName]) {
        participants[item.displayName].previousRank = participants[item.displayName].rank || (rankIdx + 1);
        participants[item.displayName].rank = rankIdx + 1;
      }
    });

    session.participants = participants;
    session.markModified('participants');
    await session.save();

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
