import { NextResponse } from 'next/server';
import { parseAndCleanCSV } from '@/lib/dataProcessor';
import { insertCleanedRecords } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No CSV file provided.' }, { status: 400 });
    }

    const fileText = await file.text();
    const { records, report } = parseAndCleanCSV(fileText);

    if (records.length > 0) {
      await insertCleanedRecords(records);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${report.validRows} health check records.`,
      report,
    });
  } catch (error: any) {
    console.error('Upload processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process CSV file.' },
      { status: 500 }
    );
  }
}