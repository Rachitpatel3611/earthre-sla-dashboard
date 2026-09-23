import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const stats = await getDashboardStats(startDate, endDate);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Stats query error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate SLA statistics.' },
      { status: 500 }
    );
  }
}