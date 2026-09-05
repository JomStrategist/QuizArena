import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';

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

    session.stage = 'QUESTION_ACTIVE';
    session.currentQuestionIndex = 0;
    session.questionStartTimestamp = Date.now();
    await session.save();

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
