import mammoth from 'mammoth';
import { IImportParseDiagnostic, IImportPreviewSummary, QuestionType, DifficultyLevel } from '@/types';

export async function parseWordQuestionFile(buffer: Buffer, fileName: string): Promise<IImportPreviewSummary> {
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value || '';

  // Split document into potential question blocks by blank lines or numbered headers
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    // Detect question start (e.g. "1.", "Q1:", "Question 1:")
    const isNewQuestion = /^(\d+[\.\)]|Q\d+:?|Question\s+\d+:?)/i.test(line);
    if (isNewQuestion && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  const diagnostics: IImportParseDiagnostic[] = [];
  const validQuestions: any[] = [];

  blocks.forEach((blockLines, index) => {
    const questionNum = index + 1;
    let questionText = '';
    const options: string[] = [];
    let correctVal = '';
    let explanationText = '';
    let timeLimitVal = 20;
    let pointsVal = 1000;

    for (const line of blockLines) {
      if (/^(\d+[\.\)]|Q\d+:?|Question\s+\d+:?)/i.test(line)) {
        // Strip question prefix
        questionText = line.replace(/^(\d+[\.\)]|Q\d+:?|Question\s+\d+:?)\s*/i, '').trim();
      } else if (/^[A-D][\.\)]\s*/i.test(line)) {
        // Option line (e.g. "A. Paris")
        const optionContent = line.replace(/^[A-D][\.\)]\s*/i, '').trim();
        options.push(optionContent);
      } else if (/^(Correct|Answer|Correct Answer):/i.test(line)) {
        correctVal = line.replace(/^(Correct|Answer|Correct Answer):\s*/i, '').trim();
      } else if (/^Explanation:/i.test(line)) {
        explanationText = line.replace(/^Explanation:\s*/i, '').trim();
      } else if (/^Time:/i.test(line)) {
        timeLimitVal = parseInt(line.replace(/[^0-9]/g, ''), 10) || 20;
      }
    }

    let errorMessage = '';
    if (!questionText) {
      errorMessage = 'Unable to identify question text.';
    } else if (options.length < 2) {
      errorMessage = 'Found fewer than 2 answer options.';
    } else if (!correctVal) {
      errorMessage = 'Missing "Correct: [A/B/C/D]" marker.';
    }

    let correctIndex = -1;
    if (!errorMessage) {
      const normalizedCorrect = correctVal.trim().toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(normalizedCorrect)) {
        const offset = normalizedCorrect.charCodeAt(0) - 65;
        if (offset < options.length) {
          correctIndex = offset;
        } else {
          errorMessage = `Correct choice letter '${normalizedCorrect}' exceeds available options.`;
        }
      } else {
        correctIndex = options.findIndex(opt => opt.trim().toLowerCase() === correctVal.trim().toLowerCase());
        if (correctIndex === -1) {
          errorMessage = `Correct answer indicator '${correctVal}' does not match any option (A/B/C/D or text).`;
        }
      }
    }

    if (errorMessage) {
      diagnostics.push({
        rowOrIndex: questionNum,
        questionText: questionText || `Question Block ${questionNum}`,
        status: 'ERROR',
        errorMessage,
      });
    } else {
      const questionType: QuestionType = 'MCQ';
      const difficulty: DifficultyLevel = 'MEDIUM';
      const questionObj = {
        questionText,
        questionType,
        options,
        correctOptionIndex: correctIndex,
        timeLimit: Math.max(5, Math.min(120, timeLimitVal)),
        points: Math.max(100, Math.min(2000, pointsVal)),
        explanation: explanationText,
        category: 'General',
        difficulty,
        tags: [],
      };

      validQuestions.push(questionObj);
      diagnostics.push({
        rowOrIndex: questionNum,
        questionText,
        status: 'VALID',
        parsedQuestion: questionObj,
      });
    }
  });

  return {
    fileName,
    fileType: 'WORD',
    totalParsed: blocks.length,
    validCount: validQuestions.length,
    errorCount: blocks.length - validQuestions.length,
    diagnostics,
    validQuestions,
  };
}
