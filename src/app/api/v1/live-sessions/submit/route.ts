import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { LiveSessionModel } from '@/models/LiveSession';
import { calculateQuestionScore } from '@/lib/game/scoringEngine';
import { emitSessionEvent } from '@/lib/game/liveSyncStream';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      quizCode,
      participantId,
      displayName,
      questionIndex,
      selectedOptionIndex,
      selectedOptionIndices,
      selectedSequence,
      selectedCategoryAssignments,
      selectedPromptBlocks,
      selectedSubAnswers,
      responseTimeMs = 1000,
    } = body;

    if (!quizCode || (!participantId && !displayName) || questionIndex === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing required submission fields.' } },
        { status: 400 }
      );
    }

    const session = await LiveSessionModel.findOne({
      quizCode: quizCode.toString().trim(),
      stage: { $ne: 'CLOSED' },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Active session not found.' } },
        { status: 404 }
      );
    }

    const participants = session.participants || {};

    // Target participant key
    let pKey = participantId;
    if (!pKey || !participants[pKey]) {
      const foundKey = Object.keys(participants).find(
        (k) => participants[k].displayName === displayName
      );
      if (foundKey) {
        pKey = foundKey;
      }
    }

    if (!pKey || !participants[pKey]) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You have not joined this active quiz session. Please join first.',
          },
        },
        { status: 403 }
      );
    }

    const targetParticipant = participants[pKey];

    const qIdx = Number(questionIndex);
    const questions = session.quizSnapshot?.questions || [];
    const question = questions[qIdx];

    if (!question) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_QUESTION', message: 'Question index out of range.' } },
        { status: 400 }
      );
    }

    // Question-specific configured time limit
    const timeLimit = question.timeLimit || session.questionTime || 20;

    // Server-authoritative response time and deadline validation
    const serverNow = Date.now();
    let actualResponseTimeMs = responseTimeMs;
    if (session.questionStartTimestamp) {
      const serverElapsedMs = Math.max(0, serverNow - session.questionStartTimestamp);
      actualResponseTimeMs = Math.min(serverElapsedMs, Math.max(100, responseTimeMs));

      if (serverElapsedMs > (timeLimit + 2) * 1000) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'TIME_EXPIRED', message: 'Question time limit has expired. Answer rejected.' },
            data: { pointsEarned: 0, isCorrect: false },
          },
          { status: 400 }
        );
      }
    }

    // Initialize answers structure
    const answers = session.answers || {};
    if (!answers[qIdx]) {
      answers[qIdx] = {};
    }

    // Prevent duplicate submission for same question
    if (answers[qIdx][pKey]) {
      const existing = answers[qIdx][pKey];
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Duplicate submission ignored. Returning existing response.',
      });
    }

    const qType = question.questionType || 'MCQ';
    const maxPts = question.points || 1000;
    let isCorrect = false;
    let isTimeout = (selectedOptionIndex === -1 || selectedOptionIndex === undefined || selectedOptionIndex === null) && !selectedSequence && !selectedCategoryAssignments && !selectedPromptBlocks && !selectedSubAnswers && (!selectedOptionIndices || selectedOptionIndices.length === 0);
    let scenarioEarnedPoints = 0;

    if (!isTimeout) {
      if (qType === 'MCQ' || qType === 'TRUE_FALSE') {
        isCorrect =
          selectedOptionIndex !== undefined &&
          selectedOptionIndex !== null &&
          Number(selectedOptionIndex) >= 0 &&
          Number(selectedOptionIndex) === Number(question.correctOptionIndex);
      } else if (qType === 'MULTIPLE_SELECT') {
        const selected: number[] = Array.isArray(selectedOptionIndices) ? selectedOptionIndices.map(Number) : [];
        const correct: number[] = Array.isArray(question.correctOptionIndices) && question.correctOptionIndices.length > 0
          ? question.correctOptionIndices.map(Number)
          : (question.correctOptionIndex !== undefined ? [Number(question.correctOptionIndex)] : []);
        
        if (correct.length > 0) {
          const correctSelectedCount = selected.filter((idx: number) => correct.includes(idx)).length;
          const wrongSelectedCount = selected.filter((idx: number) => !correct.includes(idx)).length;
          
          const scoreRatio = Math.max(0, (correctSelectedCount - wrongSelectedCount) / correct.length);
          const fullScore = session.speedScoring !== false
            ? calculateQuestionScore({
                isCorrect: true,
                maxPoints: maxPts,
                timeLimitSeconds: timeLimit,
                responseTimeMs: actualResponseTimeMs,
              })
            : maxPts;
          
          scenarioEarnedPoints = Math.round(fullScore * scoreRatio);
          isCorrect = correctSelectedCount === correct.length && wrongSelectedCount === 0;
        }
      } else if (qType === 'CORRECT_SEQUENCE') {
        let correctOrder: number[] = [];
        if (Array.isArray(question.correctOrder) && question.correctOrder.length > 0) {
          correctOrder = question.correctOrder.map(Number);
        } else if (question.sequenceData?.items && question.sequenceData.items.length > 0) {
          const sortedItems = [...question.sequenceData.items].sort((a: any, b: any) => (a.correctPosition || 0) - (b.correctPosition || 0));
          const opts = question.options || [];
          correctOrder = sortedItems.map((item: any) => {
            const idx = opts.indexOf(item.text);
            return idx !== -1 ? idx : (item.correctPosition - 1);
          });
        } else if (Array.isArray(question.options) && question.options.length > 0) {
          correctOrder = question.options.map((_: any, idx: number) => idx);
        }

        if (Array.isArray(selectedSequence) && correctOrder.length > 0) {
          const totalSteps = correctOrder.length;
          const correctCount = selectedSequence.filter((val: number, idx: number) => Number(val) === correctOrder[idx]).length;
          const isAllCorrect = correctCount === totalSteps && selectedSequence.length === totalSteps;

          const fullScore = session.speedScoring !== false
            ? calculateQuestionScore({
                isCorrect: true,
                maxPoints: maxPts,
                timeLimitSeconds: timeLimit,
                responseTimeMs: actualResponseTimeMs,
              })
            : maxPts;

          if (isAllCorrect) {
            isCorrect = true;
            scenarioEarnedPoints = fullScore;
          } else {
            isCorrect = false;
            const scoreRatio = Math.max(0, correctCount / totalSteps);
            scenarioEarnedPoints = Math.round(fullScore * scoreRatio);
          }
        }
      } else if (qType === 'DRAG_AND_DROP') {
        if (selectedCategoryAssignments && question.categoryAssignments) {
          const totalKeys = Object.keys(question.categoryAssignments);
          const correctCount = totalKeys.filter(
            (k) => selectedCategoryAssignments[k] === question.categoryAssignments[k]
          ).length;
          isCorrect = correctCount === totalKeys.length;
        }
      } else if (qType === 'PROMPT_BUILDER') {
        // Evaluate assembled prompt blocks
        if (selectedPromptBlocks && question.promptBlocks) {
          const roleOk = !question.promptBlocks.role || question.promptBlocks.role.includes(selectedPromptBlocks.role);
          const contextOk = !question.promptBlocks.context || question.promptBlocks.context.includes(selectedPromptBlocks.context);
          const taskOk = !question.promptBlocks.task || question.promptBlocks.task.includes(selectedPromptBlocks.task);
          const outputOk = !question.promptBlocks.outputFormat || question.promptBlocks.outputFormat.includes(selectedPromptBlocks.outputFormat);
          isCorrect = roleOk && contextOk && taskOk && outputOk;
        } else {
          isCorrect = false;
        }
      } else if (qType === 'SCENARIO_QUESTIONS') {
        const subQuestions = question.scenarioQuestionsData?.subQuestions || question.subQuestions || [];
        if (subQuestions.length > 0 && selectedSubAnswers) {
          let correctCount = 0;
          let earnedPtsSum = 0;

          subQuestions.forEach((sq: any, idx: number) => {
            const sqAns = selectedSubAnswers[idx];
            const sqType = sq.questionType || 'MCQ';
            const sqPts = sq.points !== undefined ? sq.points : (question.points ? Math.round(question.points / subQuestions.length) : 250);
            let sqCorrect = false;

            if (sqType === 'MCQ' || sqType === 'TRUE_FALSE') {
              const selectedIdx = typeof sqAns === 'object' && sqAns !== null && sqAns.selectedOptionIndex !== undefined
                ? sqAns.selectedOptionIndex
                : sqAns;
              sqCorrect = selectedIdx !== undefined && Number(selectedIdx) === Number(sq.correctOptionIndex);
            } else if (sqType === 'MULTIPLE_SELECT') {
              const selectedIndices = typeof sqAns === 'object' && sqAns !== null && Array.isArray(sqAns.selectedOptionIndices)
                ? sqAns.selectedOptionIndices.map(Number)
                : (Array.isArray(sqAns) ? sqAns.map(Number) : []);
              const targetIndices = Array.isArray(sq.correctOptionIndices) ? sq.correctOptionIndices.map(Number) : [];
              sqCorrect = Array.isArray(selectedIndices) && targetIndices.length > 0 &&
                selectedIndices.length === targetIndices.length &&
                selectedIndices.every((val: number) => targetIndices.includes(val));
            } else if (sqType === 'CORRECT_SEQUENCE') {
              const seq = typeof sqAns === 'object' && sqAns !== null && Array.isArray(sqAns.selectedSequence)
                ? sqAns.selectedSequence.map(Number)
                : (Array.isArray(sqAns) ? sqAns.map(Number) : []);
              let targetCorrect: number[] = [];
              if (Array.isArray(sq.correctOrder) && sq.correctOrder.length > 0) {
                targetCorrect = sq.correctOrder.map(Number);
              } else if (Array.isArray(sq.options)) {
                targetCorrect = sq.options.map((_: any, i: number) => i);
              }
              if (Array.isArray(seq) && targetCorrect.length > 0) {
                sqCorrect =
                  seq.length === targetCorrect.length &&
                  seq.every((val: number, i: number) => val === targetCorrect[i]);
              }
            } else {
              const selectedIdx = typeof sqAns === 'object' && sqAns !== null && sqAns.selectedOptionIndex !== undefined
                ? sqAns.selectedOptionIndex
                : sqAns;
              sqCorrect = selectedIdx !== undefined && Number(selectedIdx) === Number(sq.correctOptionIndex);
            }

            if (sqCorrect) {
              correctCount++;
              earnedPtsSum += sqPts;
            }
          });

          isCorrect = correctCount === subQuestions.length;
          scenarioEarnedPoints = earnedPtsSum;
        } else if (selectedOptionIndex !== undefined && question.correctOptionIndex !== undefined) {
          isCorrect = Number(selectedOptionIndex) === Number(question.correctOptionIndex);
        } else {
          isCorrect = false;
        }
      } else if (qType === 'SOLUTION_CHALLENGE') {
        if (selectedOptionIndex !== undefined && question.correctOptionIndex !== undefined) {
          isCorrect = Number(selectedOptionIndex) === Number(question.correctOptionIndex);
        } else {
          isCorrect = false;
        }
      }
    }

    let pointsEarned = 0;
    if ((qType === 'SCENARIO_QUESTIONS' && selectedSubAnswers) || qType === 'MULTIPLE_SELECT' || qType === 'CORRECT_SEQUENCE') {
      pointsEarned = scenarioEarnedPoints;
    } else if (isCorrect && !isTimeout) {
      if (session.speedScoring !== false) {
        pointsEarned = calculateQuestionScore({
          isCorrect: true,
          maxPoints: maxPts,
          timeLimitSeconds: timeLimit,
          responseTimeMs: actualResponseTimeMs,
        });
      } else {
        pointsEarned = maxPts;
      }
    }

    const responseRecord = {
      participantId: pKey,
      displayName: targetParticipant.displayName || displayName,
      questionIndex: qIdx,
      selectedOptionIndex,
      selectedOptionIndices,
      selectedSequence,
      selectedCategoryAssignments,
      selectedPromptBlocks,
      isCorrect,
      isTimeout,
      pointsEarned,
      responseTimeMs: actualResponseTimeMs,
      timestamp: serverNow,
    };

    const statField = isCorrect ? 'correctAnswers' : isTimeout ? 'unansweredCount' : 'wrongAnswers';

    // Perform atomic dot-notation MongoDB update to avoid full-document lock contention and overwrites
    await LiveSessionModel.updateOne(
      {
        _id: session._id,
        [`answers.${qIdx}.${pKey}`]: { $exists: false },
      },
      {
        $set: {
          [`answers.${qIdx}.${pKey}`]: responseRecord,
          [`participants.${pKey}.lastPointsEarned`]: pointsEarned,
          [`participants.${pKey}.lastIsCorrect`]: isCorrect,
          [`participants.${pKey}.lastResponseTimeMs`]: actualResponseTimeMs,
        },
        $inc: {
          [`participants.${pKey}.score`]: pointsEarned,
          [`participants.${pKey}.${statField}`]: 1,
        },
      }
    );

    // Broadcast ANSWER_SUBMITTED event
    emitSessionEvent(session.quizCode, 'ANSWER_SUBMITTED', {
      participantId: pKey,
      questionIndex: qIdx,
      answeredCount: Object.keys(answers[qIdx]).length,
      totalParticipants: Object.keys(participants).length,
    });

    return NextResponse.json({
      success: true,
      data: responseRecord,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
