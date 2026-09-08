export function expandQuizQuestions(questions: any[]): any[] {
  const expanded: any[] = [];
  (questions || []).forEach((q: any) => {
    if (q.questionType === 'SCENARIO_QUESTIONS' && q.scenarioQuestionsData?.subQuestions?.length > 0) {
      const scData = q.scenarioQuestionsData;
      const scenarioTitle = scData.scenarioTitle || q.questionText || 'Executive Scenario';
      const scenarioText = scData.scenarioText || q.explanation || '';
      const instructions = scData.instructions || '';
      const backgroundContext = scData.backgroundContext || '';

      scData.subQuestions.forEach((sq: any, subIdx: number) => {
        expanded.push({
          _id: `${q._id || 'sq'}_sub_${subIdx}`,
          parentScenarioId: q._id,
          questionText: sq.questionText,
          questionType: sq.questionType || 'MCQ',
          options: sq.options || [],
          correctOptionIndex: sq.correctOptionIndex,
          correctOptionIndices: sq.correctOptionIndices,
          correctOrder: sq.correctOrder,
          categories: sq.categories,
          categoryAssignments: sq.categoryAssignments,
          promptBlocks: sq.promptBlocks,
          points: sq.points !== undefined ? sq.points : 250,
          timeLimit: sq.timeLimit !== undefined ? sq.timeLimit : 20,
          explanation: sq.explanation,
          isScenarioSubQuestion: true,
          subQuestionIndex: subIdx,
          totalSubQuestions: scData.subQuestions.length,
          scenarioQuestionsData: {
            scenarioTitle,
            scenarioText,
            instructions,
            backgroundContext,
          },
        });
      });
    } else {
      expanded.push(q);
    }
  });
  return expanded;
}
