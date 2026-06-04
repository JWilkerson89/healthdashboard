'use client';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

export interface DualSeries {
  label: string;
  color: string;
  data: (number | null)[];
}

/** Two line series over a shared dated x-axis, with a small legend. */
export default function DualLineCard({
  title,
  dates,
  series,
  height = 220,
}: {
  title: string;
  dates: string[];
  series: DualSeries[];
  height?: number;
}) {
  const x = dates.map((d) => {
    const [, m, day] = d.split('-');
    return `${m}/${day}`;
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {series.map((s) => (
              <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
        <LineChart
          height={height}
          xAxis={[{ scaleType: 'point', data: x }]}
          series={series.map((s) => ({
            data: s.data,
            label: s.label,
            color: s.color,
            showMark: false,
            connectNulls: true,
          }))}
          margin={{ left: 44, right: 12, top: 10, bottom: 24 }}
          grid={{ horizontal: true }}
          slotProps={{ legend: { hidden: true } }}
        />
      </CardContent>
    </Card>
  );
}
