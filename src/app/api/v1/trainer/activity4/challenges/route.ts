import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuestionModel } from '@/models/Question';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function checkTrainerAuth(req: NextRequest) {
  const token = req.cookies.get('quizarena_token')?.value;
  const authPayload = token ? verifyToken(token) : null;
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

    const sequenceQuestions = await QuestionModel.find({ questionType: 'CORRECT_SEQUENCE' })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: sequenceQuestions,
      count: sequenceQuestions.length,
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
      scenarioTitle,
      scenarioText,
      instruction,
      explanation,
      category = 'Sequence Challenge',
      topic,
      difficulty = 'MEDIUM',
      points = 1000,
      timeLimit = 30,
      sequenceData,
    } = body;

    if (!questionText || !sequenceData || !sequenceData.items || sequenceData.items.length < 2) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'questionText and sequenceData with at least 2 items are required.' } },
        { status: 400 }
      );
    }

    const optionsText = sequenceData.items.map((it: any) => it.text);
    const newQuestion = await QuestionModel.create({
      questionText,
      questionType: 'CORRECT_SEQUENCE',
      options: optionsText,
      explanation: explanation || sequenceData.feedback || '',
      category,
      topic: topic || questionText,
      difficulty,
      points,
      timeLimit,
      sequenceData: {
        scenarioTitle: scenarioTitle || questionText,
        scenarioText: scenarioText || explanation || '',
        instruction: instruction || 'Arrange the steps in the correct order.',
        items: sequenceData.items,
        correctSequenceIds: sequenceData.correctSequenceIds || sequenceData.items.map((it: any) => it.id),
        feedback: explanation || sequenceData.feedback || '',
      },
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
      scenarioTitle,
      scenarioText,
      instruction,
      explanation,
      category,
      topic,
      difficulty,
      points,
      timeLimit,
      sequenceData,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Question ID is required for update.' } },
        { status: 400 }
      );
    }

    const updateFields: any = {};
    if (questionText) updateFields.questionText = questionText;
    if (explanation) updateFields.explanation = explanation;
    if (category) updateFields.category = category;
    if (topic) updateFields.topic = topic;
    if (difficulty) updateFields.difficulty = difficulty;
    if (points !== undefined) updateFields.points = points;
    if (timeLimit !== undefined) updateFields.timeLimit = timeLimit;

    if (sequenceData && sequenceData.items) {
      updateFields.options = sequenceData.items.map((it: any) => it.text);
      updateFields.sequenceData = {
        scenarioTitle: scenarioTitle || questionText,
        scenarioText: scenarioText || explanation || '',
        instruction: instruction || 'Arrange the steps in the correct order.',
        items: sequenceData.items,
        correctSequenceIds: sequenceData.correctSequenceIds || sequenceData.items.map((it: any) => it.id),
        feedback: explanation || sequenceData.feedback || '',
      };
    }

    const updated = await QuestionModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Sequence question not found.' } },
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
      message: 'Sequence challenge deleted successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
