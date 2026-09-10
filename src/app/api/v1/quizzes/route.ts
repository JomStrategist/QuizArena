import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuizModel } from '@/models/Quiz';
import { QuestionModel } from '@/models/Question';
import { UserModel } from '@/models/User';
import { AssignmentModel } from '@/models/Assignment';
import { SystemConfigModel } from '@/models/SystemConfig';
import { seedQuizMaterials } from '@/lib/import/seedQuizMaterials';
import { verifyToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ensureSeededQuizzes() {
  // Update legacy title if present in database
  await QuizModel.updateMany(
    { title: 'AI Concepts & Prompting Quiz' },
    { $set: { title: 'Activity 5: AI Concepts & Prompting Quiz' } }
  );

  const activity1 = await QuizModel.findOne({ title: 'Activity 1: AI or Not? Challenge' });
  const activity5 = await QuizModel.findOne({ title: 'Activity 5: AI Concepts & Prompting Quiz' });

  if (!activity1 || !activity5) {
    console.log('Seeding / restoring all 5 pre-loaded HTML Activity Quizzes...');
    await seedQuizMaterials('650000000000000000000001');
    await SystemConfigModel.updateOne(
      { key: 'html_quizzes_seeded' },
      { value: true },
      { upsert: true }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await ensureSeededQuizzes();

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
    
    // Server-side Trainer authorization check
    const token = req.cookies.get('quizarena_token')?.value;
    const authPayload = token ? verifyToken(token) : null;
    if (authPayload && authPayload.role !== 'TRAINER' && authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Trainer authorization required to create quizzes.' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      category = 'General',
      instructions,
      questionIds = [],
      trainerId = authPayload?.userId || '650000000000000000000001',
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

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, title, description, category, instructions, questionIds, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz ID is required.' } },
        { status: 400 }
      );
    }

    const quiz = await QuizModel.findById(id);
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Quiz not found.' } },
        { status: 404 }
      );
    }

    if (title) quiz.title = title.trim();
    if (description !== undefined) quiz.description = description;
    if (category) quiz.category = category;
    if (instructions !== undefined) quiz.instructions = instructions;
    if (questionIds) {
      quiz.questionIds = questionIds;
      quiz.status = questionIds.length > 0 ? 'READY' : 'DRAFT';
    }
    if (status) quiz.status = status;

    await quiz.save();
    const updatedQuiz = await QuizModel.findById(id).populate('questionIds');

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
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
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz ID is required.' } },
        { status: 400 }
      );
    }

    await QuizModel.findByIdAndDelete(id);
    await AssignmentModel.deleteMany({ quizId: id });

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
