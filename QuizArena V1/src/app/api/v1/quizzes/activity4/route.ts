import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuestionModel } from '@/models/Question';
import { SystemConfigModel } from '@/models/SystemConfig';
import { seedQuizMaterials } from '@/lib/import/seedQuizMaterials';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ensureSeededActivity4() {
  const count = await QuestionModel.countDocuments({ questionType: 'CORRECT_SEQUENCE' });
  if (count === 0) {
    console.log('Seeding Activity 4 Sequence Challenges...');
    await seedQuizMaterials('650000000000000000000001');
    await SystemConfigModel.create({ key: 'activity4_seeded', value: true });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await ensureSeededActivity4();

    const sequenceQuestions = await QuestionModel.find({ questionType: 'CORRECT_SEQUENCE' })
      .sort({ createdAt: 1 })
      .lean();

    const formatted = sequenceQuestions.map((q: any) => {
      const seqData = q.sequenceData || {};
      let items = seqData.items || [];

      // Fallback if sequenceData is not populated
      if (!items || items.length === 0) {
        const opts: string[] = q.options || [];
        items = opts.map((optText: string, idx: number) => ({
          id: `seq_${q._id}_${idx + 1}`,
          text: optText,
          correctPosition: idx + 1,
        }));
      }

      const correctSequenceIds = seqData.correctSequenceIds || items.map((it: any) => it.id);

      return {
        _id: q._id.toString(),
        title: q.questionText,
        scenarioTitle: seqData.scenarioTitle || q.questionText,
        scenarioText: seqData.scenarioText || q.explanation || 'Arrange the items into the correct logical sequence.',
        instruction: seqData.instruction || 'Arrange the steps in the correct order.',
        category: q.category || 'Sequence & Workflow',
        topic: q.topic || 'Sequence Challenge',
        difficulty: q.difficulty || 'MEDIUM',
        items,
        correctSequenceIds,
        explanation: q.explanation || seqData.feedback || '',
        points: q.points || 1000,
        timeLimit: q.timeLimit || 30,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching Activity 4 sequence challenges:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
