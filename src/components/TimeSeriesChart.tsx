'use client';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, useTheme } from '@mui/material';
import type { AccentKey } from '@/lib/themes';

export interface TimePoint {
  t: string; // UTC "YYYY-MM-DD HH:MM:SS"
  v: number;
}

/**
 * Intraday / activity time-series. Timestamps are UTC; offsetHours shifts them
 * to local wall-clock for the x-axis labels (24h HH:mm).
 */
export default function TimeSeriesChart({
  points,
  colorKey,
  unit,
  offsetHours = 0,
  height = 260,
  area = false,
}: {
  points: TimePoint[];
  colorKey: AccentKey;
  unit?: string;
  offsetHours?: number;
  height?: number;
  area?: boolean;
}) {
  const theme = useTheme();
  const color = theme.accents[colorKey] ?? theme.palette.primary.main;
  if (!points.length) {
    return (
      <Box sx={{ height, display: 'grid', placeItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          No samples
        </Typography>
      </Box>
    );
  }

  const xs = points.map((p) => {
    const ms = Date.parse(p.t.replace(' ', 'T') + 'Z') + offsetHours * 3600_000;
    return new Date(ms);
  });
  const ys = points.map((p) => p.v);

  const fmtClock = (d: Date) =>
    `${String(d.getUTCHours()).padStart(2, '0')}:${String(
      d.getUTCMinutes(),
    ).padStart(2, '0')}`;

  return (
    <LineChart
      height={height}
      xAxis={[
        {
          data: xs,
          scaleType: 'time',
          valueFormatter: (d: Date) => fmtClock(d),
        },
      ]}
      series={[
        {
          data: ys,
          color,
          area,
          showMark: false,
          connectNulls: true,
          valueFormatter: (v) => (v == null ? '—' : `${v}${unit ? ` ${unit}` : ''}`),
        },
      ]}
      margin={{ left: 48, right: 16, top: 16, bottom: 28 }}
      grid={{ horizontal: true }}
      sx={{ '& .MuiAreaElement-root': { fillOpacity: 0.12 } }}
    />
  );
}
