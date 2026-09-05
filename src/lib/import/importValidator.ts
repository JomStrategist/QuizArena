import { IImportPreviewSummary } from '@/types';
import { parseExcelQuestionFile } from './excelParser';
import { parseWordQuestionFile } from './wordParser';

export async function processUploadedQuestionFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<IImportPreviewSummary> {
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || mimeType.includes('spreadsheet') || mimeType.includes('excel');
  const isWord = fileName.endsWith('.docx') || mimeType.includes('wordprocessingml') || mimeType.includes('msword');

  if (isExcel) {
    return parseExcelQuestionFile(buffer, fileName);
  } else if (isWord) {
    return await parseWordQuestionFile(buffer, fileName);
  } else {
    throw new Error('Unsupported file format. Please upload an Excel (.xlsx, .xls) or Word (.docx) file.');
  }
}
