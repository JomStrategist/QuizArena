import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { emitSessionEvent } from '@/lib/game/liveSyncStream';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { quizCode, action } = body; // action: 'pause' | 'resume'

    if (!quizCode || !action || (action !== 'pause' && action !== 'resume')) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz code and valid action ("pause" | "resume") are required.' } },
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

    const now = Date.now();

    if (action === 'pause') {
      if (session.stage === 'PAUSED') {
        return NextResponse.json({ success: true, data: session, message: 'Session is already paused.' });
      }

      session.previousStage = session.stage;
      session.stage = 'PAUSED';
      session.pauseStartTimestamp = now;
      session.markModified('previousStage');
      session.markModified('stage');
      session.markModified('pauseStartTimestamp');
      await session.save();

      emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: 'PAUSED' });

      return NextResponse.json({
        success: true,
        data: session,
        message: 'Session paused.',
      });
    }

    if (action === 'resume') {
      if (session.stage !== 'PAUSED') {
        return NextResponse.json({ success: true, data: session, message: 'Session is not paused.' });
      }

      const pauseDuration = session.pauseStartTimestamp ? now - session.pauseStartTimestamp : 0;
      session.totalPausedMs = (session.totalPausedMs || 0) + pauseDuration;

      // Adjust questionStartTimestamp if question was active
      if (session.questionStartTimestamp) {
        session.questionStartTimestamp += pauseDuration;
        session.markModified('questionStartTimestamp');
      }

      // Restore stage
      session.stage = (session.previousStage as any) || 'QUESTION_ACTIVE';
      session.pauseStartTimestamp = undefined;

      session.markModified('totalPausedMs');
      session.markModified('stage');
      session.markModified('pauseStartTimestamp');
      await session.save();

      emitSessionEvent(session.quizCode, 'STAGE_CHANGED', { stage: session.stage });

      return NextResponse.json({
        success: true,
        data: session,
        message: 'Session resumed.',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
