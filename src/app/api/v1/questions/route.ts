import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuestionModel } from '@/models/Question';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const token = req.cookies.get('quizarena_token')?.value;
    const authPayload = token ? verifyToken(token) : null;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';

    const filter: any = {};
    if (search) {
      filter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await QuestionModel.find(filter).sort({ createdAt: -1 }).limit(300);

    return NextResponse.json({
      success: true,
      data: questions,
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
      questionText,
      options,
      correctOptionIndex,
      timeLimit = 20,
      points = 1000,
      explanation,
      category = 'General',
      topic,
      difficulty = 'MEDIUM',
      tags = [],
      trainerId = '650000000000000000000001', // Fallback Trainer ID
    } = body;

    if (!questionText || !options || options.length < 2 || correctOptionIndex === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Question text, options (>= 2), and correct answer index are required.' } },
        { status: 400 }
      );
    }

    const question = await QuestionModel.create({
      trainerId,
      questionText,
      questionType: 'MCQ',
      options,
      correctOptionIndex,
      timeLimit,
      points,
      explanation,
      category,
      topic,
      difficulty,
      tags,
    });

    return NextResponse.json({
      success: true,
      data: question,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get('id') || body._id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Question ID required for update.' } },
        { status: 400 }
      );
    }

    const updated = await QuestionModel.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Question not found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Question ID required for deletion.' } },
        { status: 400 }
      );
    }

    const deleted = await QuestionModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Question not found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
