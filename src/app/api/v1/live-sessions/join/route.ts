import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { quizCode, displayName, email } = body;

    if (!quizCode || !displayName) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz code and Display name are required.' } },
        { status: 400 }
      );
    }

    const session = await LiveSessionModel.findOne({
      quizCode: quizCode.toString().trim(),
      stage: { $ne: 'CLOSED' },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'No active session found for this Quiz Code.' } },
        { status: 404 }
      );
    }

    // Register or update participant
    const participants = session.participants || {};
    const key = displayName.trim();

    if (!participants[key]) {
      participants[key] = {
        displayName: key,
        email: email || '',
        score: 0,
        rank: Object.keys(participants).length + 1,
        previousRank: Object.keys(participants).length + 1,
        correctAnswers: 0,
        wrongAnswers: 0,
        unansweredCount: 0,
        joinedAt: new Date().toISOString(),
      };
    } else if (email) {
      participants[key].email = email;
    }

    session.participants = participants;
    session.markModified('participants');
    await session.save();

    return NextResponse.json({
      success: true,
      data: session,
      participant: participants[key],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
