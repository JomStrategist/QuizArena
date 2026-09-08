import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuestionModel } from '@/models/Question';
import { SystemConfigModel } from '@/models/SystemConfig';
import { seedQuizMaterials } from '@/lib/import/seedQuizMaterials';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ensureSeededActivity3() {
  const count = await QuestionModel.countDocuments({ questionType: 'SOLUTION_CHALLENGE' });
  if (count === 0) {
    console.log('Seeding Activity 3 Solution Challenges...');
    await seedQuizMaterials('650000000000000000000001');
    await SystemConfigModel.create({ key: 'activity3_seeded', value: true });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await ensureSeededActivity3();

    const challenges = await QuestionModel.find({ questionType: 'SOLUTION_CHALLENGE' })
      .sort({ createdAt: 1 })
      .lean();

    const formatted = challenges.map((q: any) => {
      const data = q.solutionChallengeData || {};
      return {
        _id: q._id.toString(),
        title: q.questionText,
        scenarioText: q.options && q.options.length > 0 ? q.options[0] : q.questionText,
        explanation: q.explanation,
        category: q.category || 'General',
        topic: q.topic || 'Business Challenge',
        difficulty: q.difficulty || 'MEDIUM',
        icon: data.icon || '🚀',
        dept: data.dept || q.category || 'Business Ops',
        answer: data.answer,
        objective: data.objective,
        constraints: data.constraints,
        whyApproach: data.whyApproach,
        capabilities: data.capabilities || [],
        workflow: data.workflow || [],
        autonomy: data.autonomy || [],
        controlTitle: data.controlTitle || 'Step 4: Establish Human Control & Guardrails',
        riskQuestion: data.riskQuestion || null,
        why: data.why,
        approachMarks: data.approachMarks ?? 20,
        capabilityMarks: data.capabilityMarks ?? 25,
        workflowMarks: data.workflowMarks ?? 35,
        workflowSequenceBonus: data.workflowSequenceBonus ?? 5,
        humanControlMarks: data.humanControlMarks ?? 20,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching Activity 3 challenges:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
