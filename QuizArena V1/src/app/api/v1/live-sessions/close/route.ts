import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { LiveSessionResultModel } from '@/models/LiveSessionResult';
import { emitSessionEvent } from '@/lib/game/liveSyncStream';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { quizCode } = body;

    if (!quizCode) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Quiz code is required.' } },
        { status: 400 }
      );
    }

    const session = await LiveSessionModel.findOne({
      quizCode: quizCode.toString().trim(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Session not found.' } },
        { status: 404 }
      );
    }

    session.stage = 'CLOSED';
    session.closedAt = new Date();
    await session.save();

    emitSessionEvent(session.quizCode, 'GAME_CLOSED', { quizCode: session.quizCode });

    // Compile & store historical result record
    const participantsList = Object.values(session.participants || {}).sort(
      (a: any, b: any) => (b.score || 0) - (a.score || 0)
    );

    const totalParticipants = participantsList.length;
    const totalScoreSum = participantsList.reduce((acc: number, p: any) => acc + (p.score || 0), 0);
    const averageScore = totalParticipants > 0 ? Math.round(totalScoreSum / totalParticipants) : 0;

    const rankings = participantsList.map((p: any, idx: number) => ({
      rank: idx + 1,
      displayName: p.displayName,
      email: p.email || '',
      totalScore: p.score || 0,
      correctAnswers: p.correctAnswers || 0,
      wrongAnswers: p.wrongAnswers || 0,
      unansweredCount: p.unansweredCount || 0,
    }));

    const questions = session.quizSnapshot?.questions || [];
    const questionStats = questions.map((q: any, qIdx: number) => {
      const answersForQ = (session.answers && session.answers[qIdx]) || {};
      let correctCount = 0;
      let wrongCount = 0;
      let totalResponseTimeMs = 0;
      const optionDistribution: Record<number, number> = {};

      Object.values(answersForQ).forEach((ans: any) => {
        if (ans.isCorrect) correctCount++;
        else wrongCount++;
        totalResponseTimeMs += ans.responseTimeMs || 0;
        if (ans.selectedOptionIndex >= 0) {
          optionDistribution[ans.selectedOptionIndex] =
            (optionDistribution[ans.selectedOptionIndex] || 0) + 1;
        }
      });

      const totalAns = Object.keys(answersForQ).length;
      return {
        questionIndex: qIdx,
        questionText: q.questionText || `Question ${qIdx + 1}`,
        correctCount,
        wrongCount,
        optionDistribution,
        avgResponseTimeMs: totalAns > 0 ? Math.round(totalResponseTimeMs / totalAns) : 0,
      };
    });

    const resultDoc = await LiveSessionResultModel.create({
      quizCode: session.quizCode,
      quizTitle: session.quizTitle,
      trainerId: session.trainerId,
      totalParticipants,
      averageScore,
      rankings,
      questionStats,
    });

    return NextResponse.json({
      success: true,
      data: {
        session,
        result: resultDoc,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
