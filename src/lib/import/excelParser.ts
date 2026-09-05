import * as XLSX from 'xlsx';
import { IImportParseDiagnostic, IImportPreviewSummary, QuestionType, DifficultyLevel } from '@/types';

export function parseExcelQuestionFile(buffer: Buffer, fileName: string): IImportPreviewSummary {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const diagnostics: IImportParseDiagnostic[] = [];
  const validQuestions: any[] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // 1-indexed row accounting for header
    
    // Normalize header keys case-insensitively
    const keys = Object.keys(row);
    const getVal = (possibleNames: string[]) => {
      const foundKey = keys.find(k => possibleNames.some(p => k.trim().toLowerCase() === p.toLowerCase()));
      return foundKey ? String(row[foundKey]).trim() : '';
    };

    const questionText = getVal(['question', 'questiontext', 'question text']);
    const optionA = getVal(['option a', 'optiona', 'a', 'choice a']);
    const optionB = getVal(['option b', 'optionb', 'b', 'choice b']);
    const optionC = getVal(['option c', 'optionc', 'c', 'choice c']);
    const optionD = getVal(['option d', 'optiond', 'd', 'choice d']);
    const correctVal = getVal(['correct answer', 'correctanswer', 'correct', 'answer']);
    const questionTypeVal = getVal(['question type', 'type']) || 'MCQ';
    const timeLimitVal = parseInt(getVal(['time limit', 'time', 'timer']), 10) || 20;
    const pointsVal = parseInt(getVal(['points', 'score']), 10) || 1000;
    const explanationText = getVal(['explanation', 'notes']);
    const categoryText = getVal(['category', 'subject']) || 'General';

    // Collect choices
    const rawOptions = [optionA, optionB, optionC, optionD].filter(Boolean);

    // Validation checks
    let errorMessage = '';
    if (!questionText) {
      errorMessage = 'Missing question text.';
    } else if (rawOptions.length < 2) {
      errorMessage = 'Question must provide at least 2 answer options.';
    } else if (!correctVal) {
      errorMessage = 'Missing correct answer designation.';
    }

    let correctIndex = -1;
    if (!errorMessage) {
      const normalizedCorrect = correctVal.trim().toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(normalizedCorrect)) {
        const charCodeOffset = normalizedCorrect.charCodeAt(0) - 65;
        if (charCodeOffset < rawOptions.length) {
          correctIndex = charCodeOffset;
        } else {
          errorMessage = `Correct option letter '${normalizedCorrect}' exceeds provided options count (${rawOptions.length}).`;
        }
      } else {
        // Try matching text directly
        correctIndex = rawOptions.findIndex(opt => opt.trim().toLowerCase() === correctVal.trim().toLowerCase());
        if (correctIndex === -1) {
          errorMessage = `Correct answer '${correctVal}' does not match any option (A, B, C, D or exact text).`;
        }
      }
    }

    if (errorMessage) {
      diagnostics.push({
        rowOrIndex: rowNum,
        questionText: questionText || `Row ${rowNum}`,
        status: 'ERROR',
        errorMessage,
      });
    } else {
      const questionType: QuestionType = questionTypeVal.toUpperCase().includes('TRUE') ? 'TRUE_FALSE' : 'MCQ';
      const difficulty: DifficultyLevel = 'MEDIUM';
      const questionObj = {
        questionText,
        questionType,
        options: rawOptions,
        correctOptionIndex: correctIndex,
        timeLimit: Math.max(5, Math.min(120, timeLimitVal)),
        points: Math.max(100, Math.min(2000, pointsVal)),
        explanation: explanationText,
        category: categoryText,
        difficulty,
        tags: [],
      };
      
      validQuestions.push(questionObj);
      diagnostics.push({
        rowOrIndex: rowNum,
        questionText,
        status: 'VALID',
        parsedQuestion: questionObj,
      });
    }
  });

  return {
    fileName,
    fileType: 'EXCEL',
    totalParsed: rawRows.length,
    validCount: validQuestions.length,
    errorCount: rawRows.length - validQuestions.length,
    diagnostics,
    validQuestions,
  };
}
