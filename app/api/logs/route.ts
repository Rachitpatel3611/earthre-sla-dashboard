import { NextResponse } from 'next/server';
import { getFilteredLogs } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const serviceId = searchParams.get('serviceId') || '';
    const statusType = searchParams.get('statusType') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await getFilteredLogs({
      startDate,
      endDate,
      serviceId,
      statusType,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Logs query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}