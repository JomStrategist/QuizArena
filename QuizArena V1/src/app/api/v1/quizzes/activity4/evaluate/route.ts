import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuestionModel } from '@/models/Question';
import { ISequenceItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      questionId,
      learnerSequenceIds = [],
      timeSpentSeconds = 0,
    } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'questionId is required.' } },
        { status: 400 }
      );
    }

    const questionObj = await QuestionModel.findById(questionId).lean();
    if (!questionObj || questionObj.questionType !== 'CORRECT_SEQUENCE') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Sequence question not found.' } },
        { status: 404 }
      );
    }

    const maxPoints = questionObj.points || 1000;
    const seqData = questionObj.sequenceData || {};
    let items: ISequenceItem[] = seqData.items || [];

    // Fallback if items not in sequenceData
    if (!items || items.length === 0) {
      const opts: string[] = questionObj.options || [];
      items = opts.map((optText: string, idx: number) => ({
        id: `seq_${questionObj._id}_${idx + 1}`,
        text: optText,
        correctPosition: idx + 1,
      }));
    }

    // Determine expected correct order of IDs
    let expectedSequenceIds: string[] = seqData.correctSequenceIds;
    if (!expectedSequenceIds || expectedSequenceIds.length === 0) {
      const sortedByPos = [...items].sort((a, b) => a.correctPosition - b.correctPosition);
      expectedSequenceIds = sortedByPos.map((it) => it.id);
    }

    const totalPositions = expectedSequenceIds.length;
    const itemMap = new Map<string, ISequenceItem>(items.map((it) => [it.id, it]));

    // Evaluate position by position
    let correctCount = 0;
    const positionResults = learnerSequenceIds.map((submittedId: string, idx: number) => {
      const expectedId = expectedSequenceIds[idx];
      const isCorrectPosition = submittedId === expectedId;
      if (isCorrectPosition) correctCount++;

      const submittedItem = itemMap.get(submittedId);
      const expectedItem = itemMap.get(expectedId);

      return {
        position: idx + 1,
        submittedId,
        submittedText: submittedItem?.text || 'Unknown Step',
        isCorrectPosition,
        expectedId,
        expectedText: expectedItem?.text || 'Unknown Step',
      };
    });

    const isExactSequence = correctCount === totalPositions;
    const percentage = Math.round((correctCount / totalPositions) * 100);
    const score = Math.round((correctCount / totalPositions) * maxPoints);

    let feedbackTitle = 'Sequence Needs Improvement';
    if (isExactSequence) {
      feedbackTitle = '✓ Perfect Sequence! Excellent Job!';
    } else if (percentage >= 60) {
      feedbackTitle = 'Partially Correct Sequence 👍';
    }

    const explanation = questionObj.explanation || seqData.feedback || 'Review the correct logical sequence above.';

    return NextResponse.json({
      success: true,
      data: {
        questionId,
        totalScore: score,
        maxPossibleScore: maxPoints,
        percentage,
        correctCount,
        totalPositions,
        isExactSequence,
        feedbackTitle,
        positionResults,
        explanation,
        timeSpentSeconds,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error evaluating sequence challenge:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
