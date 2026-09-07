import { NextRequest, NextResponse } from 'next/server';
import { seedQuizMaterials } from '@/lib/import/seedQuizMaterials';

export async function POST(req: NextRequest) {
  try {
    let trainerId = '650000000000000000000001';
    try {
      const body = await req.json();
      if (body.trainerId) trainerId = body.trainerId;
    } catch (e) {}

    const result = await seedQuizMaterials(trainerId);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.totalQuestionsSeeded} questions across 4 HTML Quiz Materials!`,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
