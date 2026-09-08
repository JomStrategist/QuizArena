import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { emitSessionEvent } from '@/lib/game/liveSyncStream';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { quizCode } = body;

    if (!quizCode) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz code is required.' } },
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

    const questions = session.quizSnapshot?.questions || [];
    const totalQuestions = questions.length;

    // Advance Stage Logic:
    // 1. If currently in QUESTION_ACTIVE -> Move to SHOWING_RESULT
    // 2. If in SHOWING_RESULT, LEADERBOARD, or STARTING -> Move to next question or final podium
    if (session.stage === 'QUESTION_ACTIVE' || session.stage === 'STARTING') {
      session.stage = 'SHOWING_RESULT';
      session.stageStartTimestamp = Date.now();
      session.markModified('stage');
      session.markModified('stageStartTimestamp');
      await session.save();

      emitSessionEvent(session.quizCode, 'STAGE_CHANGED', {
        stage: 'SHOWING_RESULT',
        questionIndex: session.currentQuestionIndex,
      });
    } else {
      // Advance to next question or end
      if (session.currentQuestionIndex < totalQuestions - 1) {
        session.currentQuestionIndex = session.currentQuestionIndex + 1;
        session.stage = 'QUESTION_ACTIVE';
        session.questionStartTimestamp = Date.now();
        session.markModified('currentQuestionIndex');
        session.markModified('stage');
        session.markModified('questionStartTimestamp');
        await session.save();

        emitSessionEvent(session.quizCode, 'STAGE_CHANGED', {
          stage: 'QUESTION_ACTIVE',
          questionIndex: session.currentQuestionIndex,
        });
      } else {
        session.stage = session.finalPodium !== false ? 'FINAL_PODIUM' : 'FINAL_SCOREBOARD';
        session.closedAt = new Date();
        session.markModified('stage');
        session.markModified('closedAt');
        await session.save();

        emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: session.stage });
      }
    }

    return NextResponse.json({
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
