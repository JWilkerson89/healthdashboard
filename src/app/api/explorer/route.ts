import { NextRequest, NextResponse } from 'next/server';
import { metricDef, metricDates, metricSeries } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// GET /api/explorer?metric=heart_rate&date=2026-06-02
// Returns the day's samples plus the dates available for that metric.
export function GET(req: NextRequest) {
  const metric = req.nextUrl.searchParams.get('metric') ?? '';
  const def = metricDef(metric);
  if (!def) {
    return NextResponse.json({ error: 'unknown metric' }, { status: 400 });
  }
  const dates = metricDates(metric);
  const date = req.nextUrl.searchParams.get('date') ?? dates[0];
  const points = date ? metricSeries(metric, date) : [];
  return NextResponse.json({ def, dates, date, points });
}
