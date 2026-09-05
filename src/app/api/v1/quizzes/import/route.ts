import { NextRequest, NextResponse } from 'next/server';
import { processUploadedQuestionFile } from '@/lib/import/importValidator';
import { connectToDatabase } from '@/lib/db/connect';
import { QuestionModel } from '@/models/Question';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const confirmImport = formData.get('confirm') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'No file provided.' } },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const summary = await processUploadedQuestionFile(buffer, file.name, file.type);

    if (confirmImport && summary.validQuestions.length > 0) {
      await connectToDatabase();
      const trainerId = '650000000000000000000001';

      const questionsToSave = summary.validQuestions.map((q) => ({
        ...q,
        trainerId,
      }));

      const savedQuestions = await QuestionModel.insertMany(questionsToSave);

      return NextResponse.json({
        success: true,
        data: {
          importedCount: savedQuestions.length,
          questions: savedQuestions,
          summary,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Default: return Preview summary without inserting
    return NextResponse.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'IMPORT_FAILED', message: error.message || 'File import failed.' } },
      { status: 500 }
    );
  }
}
