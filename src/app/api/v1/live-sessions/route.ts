import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { QuizModel } from '@/models/Quiz';

function generateQuizCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { quizId, trainerId = '650000000000000000000001', trainerName = 'KVJ Trainer' } = body;

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz ID is required.' } },
        { status: 400 }
      );
    }

    const quiz = await QuizModel.findById(quizId).populate('questionIds');
    if (!quiz || !quiz.questionIds || quiz.questionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_QUIZ', message: 'Quiz must contain at least 1 valid question to launch a live session.' } },
        { status: 400 }
      );
    }

    // Generate unique active 6-digit code
    let quizCode = generateQuizCode();
    let existing = await LiveSessionModel.findOne({ quizCode, stage: { $ne: 'CLOSED' } });
    let attempts = 0;
    while (existing && attempts < 10) {
      quizCode = generateQuizCode();
      existing = await LiveSessionModel.findOne({ quizCode, stage: { $ne: 'CLOSED' } });
      attempts++;
    }

    // Freeze snapshot
    const quizSnapshot = {
      _id: quiz._id.toString(),
      title: quiz.title,
      category: quiz.category,
      questions: quiz.questionIds,
    };

    const session = await LiveSessionModel.create({
      quizCode,
      quizId: quiz._id,
      quizTitle: quiz.title,
      trainerId,
      trainerName,
      stage: 'LOBBY',
      currentQuestionIndex: 0,
      quizSnapshot,
      participants: {},
    });

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

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const quizCode = searchParams.get('code');

    if (!quizCode) {
      const sessions = await LiveSessionModel.find().sort({ createdAt: -1 }).limit(20);
      return NextResponse.json({ success: true, data: sessions, timestamp: new Date().toISOString() });
    }

    const session = await LiveSessionModel.findOne({ quizCode, stage: { $ne: 'CLOSED' } });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Live Session not found or has closed.' } },
        { status: 404 }
      );
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
