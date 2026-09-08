import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionResultModel } from '@/models/LiveSessionResult';
import { LiveSessionModel } from '@/models/LiveSession';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const quizCode = searchParams.get('code');
    const trainerId = searchParams.get('trainerId');

    if (quizCode) {
      let result = await LiveSessionResultModel.findOne({ quizCode }).lean();
      if (!result) {
        // If not closed yet but session exists, calculate live result summary
        const session = await LiveSessionModel.findOne({ quizCode }).lean();
        if (session) {
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

          result = {
            quizCode: session.quizCode,
            quizTitle: session.quizTitle,
            trainerId: session.trainerId,
            totalParticipants,
            averageScore,
            rankings,
            questionStats,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          } as any;
        }
      }

      if (!result) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Result report not found.' } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    }

    // Return list of completed results for trainer or all
    const query = trainerId ? { trainerId } : {};
    const results = await LiveSessionResultModel.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
