import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { AssignmentModel } from '@/models/Assignment';
import { QuizModel } from '@/models/Quiz';
import { QuestionModel } from '@/models/Question';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const filter: any = {};
    if (email) {
      filter.studentEmails = { $in: [email.toLowerCase().trim()] };
    }

    const assignments = await AssignmentModel.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: assignments,
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
      quizId,
      title,
      studentEmails = [],
      dueDate,
      maxAttempts = 1,
      showScoreImmediately = true,
      showCorrectAnswers = true,
      trainerId = '650000000000000000000001',
      trainerName = 'KVJ Trainer',
    } = body;

    if (!quizId || !studentEmails.length || !dueDate) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz ID, student emails list, and due date are required.' } },
        { status: 400 }
      );
    }

    const quiz = await QuizModel.findById(quizId).populate('questionIds');
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Quiz not found.' } },
        { status: 404 }
      );
    }

    // Capture frozen immutable snapshot
    const quizSnapshot = {
      _id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      instructions: quiz.instructions,
      questions: quiz.questionIds,
    };

    const cleanEmails = studentEmails.map((e: string) => e.trim().toLowerCase());

    const assignment = await AssignmentModel.create({
      quizId: quiz._id,
      quizTitle: quiz.title,
      trainerId,
      trainerName,
      title: title || `${quiz.title} Assignment`,
      studentEmails: cleanEmails,
      dueDate: new Date(dueDate),
      maxAttempts,
      showScoreImmediately,
      showCorrectAnswers,
      quizSnapshot,
    });

    return NextResponse.json({
      success: true,
      data: assignment,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
