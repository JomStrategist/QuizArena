import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuizModel } from '@/models/Quiz';
import { QuestionModel } from '@/models/Question';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const filter: any = {};
    if (category) filter.category = category;

    const quizzes = await QuizModel.find(filter)
      .populate('questionIds')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: quizzes,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      title,
      description,
      category = 'General',
      instructions,
      questionIds = [],
      trainerId = '650000000000000000000001',
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz title is required.' } },
        { status: 400 }
      );
    }

    const quiz = await QuizModel.create({
      trainerId,
      title,
      description,
      category,
      instructions,
      questionIds,
      status: questionIds.length > 0 ? 'READY' : 'DRAFT',
    });

    const populatedQuiz = await QuizModel.findById(quiz._id).populate('questionIds');

    return NextResponse.json({
      success: true,
      data: populatedQuiz,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
