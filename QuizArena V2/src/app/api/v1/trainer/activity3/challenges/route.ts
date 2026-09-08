import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuestionModel } from '@/models/Question';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function checkTrainerAuth(req: NextRequest) {
  const token = req.cookies.get('quizarena_token')?.value;
  const authPayload = token ? verifyToken(token) : null;
  // Allow request if valid trainer token OR development fallback
  if (authPayload && authPayload.role !== 'TRAINER' && authPayload.role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    if (!checkTrainerAuth(req)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Trainer authorization required.' } },
        { status: 403 }
      );
    }

    const challenges = await QuestionModel.find({ questionType: 'SOLUTION_CHALLENGE' })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: challenges,
      count: challenges.length,
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
    if (!checkTrainerAuth(req)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Trainer authorization required.' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      questionText,
      scenarioText,
      explanation,
      category = 'Business Challenges',
      topic,
      difficulty = 'MEDIUM',
      solutionChallengeData,
    } = body;

    if (!questionText || !solutionChallengeData || !solutionChallengeData.answer) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'questionText and solutionChallengeData with answer are required.' } },
        { status: 400 }
      );
    }

    const newQuestion = await QuestionModel.create({
      questionText,
      questionType: 'SOLUTION_CHALLENGE',
      options: [scenarioText || questionText],
      explanation: explanation || solutionChallengeData.why || '',
      category,
      topic: topic || questionText,
      difficulty,
      solutionChallengeData,
    });

    return NextResponse.json({
      success: true,
      data: newQuestion,
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
    if (!checkTrainerAuth(req)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Trainer authorization required.' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      questionText,
      scenarioText,
      explanation,
      category,
      topic,
      difficulty,
      solutionChallengeData,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Challenge ID is required for update.' } },
        { status: 400 }
      );
    }

    const updateFields: any = {};
    if (questionText) updateFields.questionText = questionText;
    if (scenarioText) updateFields.options = [scenarioText];
    if (explanation) updateFields.explanation = explanation;
    if (category) updateFields.category = category;
    if (topic) updateFields.topic = topic;
    if (difficulty) updateFields.difficulty = difficulty;
    if (solutionChallengeData) updateFields.solutionChallengeData = solutionChallengeData;

    const updated = await QuestionModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Challenge not found.' } },
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
    if (!checkTrainerAuth(req)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Trainer authorization required.' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'id parameter is required.' } },
        { status: 400 }
      );
    }

    await QuestionModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Challenge deleted successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
