import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { emitSessionEvent } from '@/lib/game/liveSyncStream';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { quizCode, scoreboardVisibility, showLeaderboard } = body;

    if (!quizCode) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz code is required.' } },
        { status: 400 }
      );
    }

    const session = await LiveSessionModel.findOne({ quizCode, stage: { $ne: 'CLOSED' } });
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Session not found or closed.' } },
        { status: 404 }
      );
    }

    if (scoreboardVisibility !== undefined) {
      session.scoreboardVisibility = scoreboardVisibility === 'TRAINER_ONLY' ? 'TRAINER_ONLY' : 'EVERYONE';
      session.markModified('scoreboardVisibility');
    }

    if (showLeaderboard !== undefined) {
      session.showLeaderboard = Boolean(showLeaderboard);
      session.markModified('showLeaderboard');
    }

    await session.save();

    emitSessionEvent(session.quizCode, 'SETTINGS_UPDATED', {
      scoreboardVisibility: session.scoreboardVisibility,
      showLeaderboard: session.showLeaderboard,
    });

    return NextResponse.json({
      success: true,
      data: {
        scoreboardVisibility: session.scoreboardVisibility,
        showLeaderboard: session.showLeaderboard,
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
