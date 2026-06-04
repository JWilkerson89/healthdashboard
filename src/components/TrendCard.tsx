'use client';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import type { AccentKey } from '@/lib/themes';

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  value: number | null;
}

/** Compact y-axis tick labels: 10000 → "10k", keeps small values as-is. */
function compact(v: number): string {
  if (v == null) return '';
  if (Math.abs(v) >= 1000) return `${Math.round(v / 100) / 10}k`;
  return String(v);
}

/** A titled card wrapping a single-series line chart over dated points. */
export default function TrendCard({
  title,
  data,
  colorKey,
  unit,
  height = 180,
  area = true,
}: {
  title: string;
  data: TrendPoint[];
  colorKey: AccentKey;
  unit?: string;
  height?: number;
  area?: boolean;
}) {
  const theme = useTheme();
  const color = theme.accents[colorKey] ?? theme.palette.primary.main;
  const x = data.map((d) => {
    const [, m, day] = d.date.split('-');
    return `${m}/${day}`;
  });
  const y = data.map((d) => d.value);
  const valid = y.filter((v): v is number => v != null);
  const latest = [...y].reverse().find((v) => v != null);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h6" sx={{ color }}>
            {latest != null ? Math.round(latest * 10) / 10 : '—'}
            {unit ? ` ${unit}` : ''}
          </Typography>
        </Box>
        {valid.length === 0 ? (
          <Box sx={{ height, display: 'grid', placeItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              No data
            </Typography>
          </Box>
        ) : (
          <LineChart
            height={height}
            xAxis={[{ scaleType: 'point', data: x }]}
            yAxis={[{ valueFormatter: (v: number) => compact(v) }]}
            series={[
              {
                data: y,
                color,
                area,
                showMark: false,
                connectNulls: true,
                valueFormatter: (v) => (v == null ? '—' : String(v)),
              },
            ]}
            margin={{ left: 48, right: 12, top: 10, bottom: 24 }}
            grid={{ horizontal: true }}
            sx={{
              '& .MuiAreaElement-root': { fillOpacity: 0.12 },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
