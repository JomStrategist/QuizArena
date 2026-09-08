import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { QuestionModel } from '@/models/Question';
import { ISolutionChallengeData, ISolutionChallengeCapability, ISolutionChallengeWorkflowStep, ISolutionChallengeAutonomy } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      challengeId,
      approach,
      capabilityIds = [],
      workflowSequenceIds = [],
      autonomyId,
      riskOptionId,
      timeSpentSeconds = 0,
    } = body;

    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'challengeId is required.' } },
        { status: 400 }
      );
    }

    const questionObj = await QuestionModel.findById(challengeId).lean();
    if (!questionObj || questionObj.questionType !== 'SOLUTION_CHALLENGE') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Challenge not found.' } },
        { status: 404 }
      );
    }

    const data: ISolutionChallengeData = questionObj.solutionChallengeData || {};

    const maxApproach = data.approachMarks ?? 20;
    const maxCapabilities = data.capabilityMarks ?? 25;
    const maxWorkflow = data.workflowMarks ?? 35;
    const maxAutonomy = data.humanControlMarks ?? 20;
    const seqBonusConfig = data.workflowSequenceBonus ?? 5;

    // --- STEP 1: Approach Evaluation (20 Marks) ---
    const approachIsCorrect = approach === data.answer;
    const approachScore = approachIsCorrect ? maxApproach : 0;

    // --- STEP 2: Capability Selection Evaluation (25 Marks) ---
    const capabilities: ISolutionChallengeCapability[] = data.capabilities || [];
    const correctCapSet = new Set(capabilities.filter((c) => c.isCorrect).map((c) => c.id));
    const distractorCapSet = new Set(capabilities.filter((c) => !c.isCorrect).map((c) => c.id));

    const totalCorrectCaps = correctCapSet.size || 1;
    const capUnitValue = maxCapabilities / totalCorrectCaps;
    const capPenaltyUnit = data.capabilityPenalty ?? capUnitValue * 0.5;

    let selectedCorrectCapsCount = 0;
    let selectedDistractorCapsCount = 0;

    capabilityIds.forEach((id: string) => {
      if (correctCapSet.has(id)) selectedCorrectCapsCount++;
      else if (distractorCapSet.has(id)) selectedDistractorCapsCount++;
    });

    const rawCapScore = selectedCorrectCapsCount * capUnitValue - selectedDistractorCapsCount * capPenaltyUnit;
    const capScore = Math.max(0, Math.min(maxCapabilities, rawCapScore));

    // --- STEP 3: Workflow Sequence Evaluation (35 Marks: 30 selection + 5 order bonus) ---
    const workflow: ISolutionChallengeWorkflowStep[] = data.workflow || [];
    const correctWfSteps = workflow.filter((w) => w.isCorrect).sort((a, b) => (a.correctOrder || 0) - (b.correctOrder || 0));
    const correctWfSet = new Set(correctWfSteps.map((w) => w.id));
    const distractorWfSet = new Set(workflow.filter((w) => !w.isCorrect).map((w) => w.id));

    const totalCorrectWf = correctWfSteps.length || 1;
    const wfBaseMax = maxWorkflow - seqBonusConfig; // 30 marks
    const wfUnitValue = wfBaseMax / totalCorrectWf;
    const wfPenaltyUnit = data.workflowPenalty ?? wfUnitValue * 0.5;

    let selectedCorrectWfCount = 0;
    let selectedDistractorWfCount = 0;

    workflowSequenceIds.forEach((id: string) => {
      if (correctWfSet.has(id)) selectedCorrectWfCount++;
      else if (distractorWfSet.has(id)) selectedDistractorWfCount++;
    });

    const rawWfSelectionScore = selectedCorrectWfCount * wfUnitValue - selectedDistractorWfCount * wfPenaltyUnit;
    const wfSelectionScore = Math.max(0, Math.min(wfBaseMax, rawWfSelectionScore));

    // Check exact sequence order bonus (+5)
    // Filter selected sequence to only correct workflow steps
    const selectedCorrectWfSequence = workflowSequenceIds.filter((id: string) => correctWfSet.has(id));
    const expectedOrderIds = correctWfSteps.map((w) => w.id);

    let isExactSequence = false;
    if (
      selectedCorrectWfSequence.length === expectedOrderIds.length &&
      selectedCorrectWfSequence.every((id: string, idx: number) => id === expectedOrderIds[idx])
    ) {
      isExactSequence = true;
    }

    const sequenceBonus = isExactSequence ? seqBonusConfig : 0;
    const wfScore = Math.min(maxWorkflow, wfSelectionScore + sequenceBonus);

    // --- STEP 4: Autonomy / Human Control Evaluation (20 Marks) ---
    const autonomyList: ISolutionChallengeAutonomy[] = data.autonomy || [];
    const correctAutonomy = autonomyList.find((a) => a.isCorrect);
    const autonomyIsCorrect = correctAutonomy ? autonomyId === correctAutonomy.id : false;
    const autonomyScore = autonomyIsCorrect ? maxAutonomy : 0;

    // --- OVERALL CALCULATION ---
    const totalScore = Math.round(approachScore + capScore + wfScore + autonomyScore);

    let performanceLevel: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' = 'NEEDS_IMPROVEMENT';
    let performanceTitle = 'Needs Improvement';
    if (totalScore >= 90) {
      performanceLevel = 'EXCELLENT';
      performanceTitle = 'Excellent Solution! 🚀';
    } else if (totalScore >= 75) {
      performanceLevel = 'GOOD';
      performanceTitle = 'Good Solution 👍';
    }

    // Risk Question check (if provided)
    let riskResult = null;
    if (data.riskQuestion && riskOptionId) {
      const selectedRiskOpt = data.riskQuestion.options?.find((o) => o.id === riskOptionId);
      riskResult = {
        selectedId: riskOptionId,
        isCorrect: !!selectedRiskOpt?.isCorrect,
        explanation: data.riskQuestion.explanation,
      };
    }

    // Detailed Breakdown Items for UI rendering
    const capabilityDetails = capabilities.map((c) => ({
      id: c.id,
      text: c.text,
      isCorrect: c.isCorrect,
      isSelected: capabilityIds.includes(c.id),
      description: c.description,
    }));

    const workflowDetails = workflow.map((w) => ({
      id: w.id,
      text: w.text,
      isCorrect: w.isCorrect,
      correctOrder: w.correctOrder,
      userOrderIndex: workflowSequenceIds.indexOf(w.id),
      isSelected: workflowSequenceIds.includes(w.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        challengeId,
        totalScore,
        maxPossibleScore: 100,
        performanceLevel,
        performanceTitle,
        timeSpentSeconds,
        breakdown: {
          approach: {
            score: Math.round(approachScore),
            max: maxApproach,
            isCorrect: approachIsCorrect,
            selected: approach,
            correct: data.answer,
            rationale: data.whyApproach || data.why,
          },
          capabilities: {
            score: Math.round(capScore),
            max: maxCapabilities,
            selectedCorrectCount: selectedCorrectCapsCount,
            totalCorrectCount: totalCorrectCaps,
            selectedDistractorCount: selectedDistractorCapsCount,
            items: capabilityDetails,
          },
          workflow: {
            score: Math.round(wfScore),
            max: maxWorkflow,
            selectionScore: Math.round(wfSelectionScore),
            sequenceBonus,
            isExactSequence,
            selectedCorrectCount: selectedCorrectWfCount,
            totalCorrectCount: totalCorrectWf,
            items: workflowDetails,
            expectedOrder: correctWfSteps.map((w) => w.text),
          },
          autonomy: {
            score: Math.round(autonomyScore),
            max: maxAutonomy,
            isCorrect: autonomyIsCorrect,
            selectedId: autonomyId,
            correctId: correctAutonomy?.id,
            correctTitle: correctAutonomy?.title,
            rationale: correctAutonomy?.description,
            options: autonomyList,
          },
          riskQuestion: riskResult,
        },
        whySolution: data.why,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error evaluating Activity 3 challenge:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
