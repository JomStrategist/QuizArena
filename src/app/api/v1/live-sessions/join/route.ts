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

    // Generate or reuse unique participantId
    let { participantId } = body;
    const participants = session.participants || {};
    const maxLimit = session.maxParticipants || 200;
    const isExistingParticipant = Boolean(participantId && participants[participantId]);

    // Late join check: If game has already started and user is NOT an existing participant
    if (!isExistingParticipant && session.stage !== 'LOBBY') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GAME_ALREADY_STARTED',
            message: 'This Live Game has already started. Late joining is not allowed.',
          },
        },
        { status: 403 }
      );
    }

    // Capacity limit check
    if (!isExistingParticipant && Object.keys(participants).length >= maxLimit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GAME_FULL',
            message: `This Live Game is full (maximum ${maxLimit} participants reached).`,
          },
        },
        { status: 403 }
      );
    }

    if (!participantId || !participants[participantId]) {
      const randHex = Math.random().toString(36).substring(2, 9);
      participantId = `p_${randHex}_${Date.now().toString(36)}`;
    }

    const name = displayName.trim();

    if (!participants[participantId]) {
      participants[participantId] = {
        participantId,
        displayName: name,
        email: email || '',
        score: 0,
        rank: Object.keys(participants).length + 1,
        previousRank: Object.keys(participants).length + 1,
        correctAnswers: 0,
        wrongAnswers: 0,
        unansweredCount: 0,
        joinedAt: new Date().toISOString(),
      };
    } else {
      participants[participantId].displayName = name;
      if (email) participants[participantId].email = email;
    }

    session.participants = participants;
    session.markModified('participants');
    await session.save();

    return NextResponse.json({
      success: true,
      data: session,
      participantId,
      participant: participants[participantId],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
