'use client';
import { useState } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import TrendCard from '@/components/TrendCard';
import type { AccentKey } from '@/lib/themes';
import type { DailySummary } from '@/lib/queries';

const METRICS: { key: keyof DailySummary; title: string; colorKey: AccentKey; unit?: string }[] = [
  { key: 'hrv', title: 'HRV', colorKey: 'hrv', unit: 'ms' },
  { key: 'sleep_score', title: 'Sleep Score', colorKey: 'sleep' },
  { key: 'resting_hr', title: 'Resting HR', colorKey: 'rhr', unit: 'bpm' },
  { key: 'total_steps', title: 'Steps', colorKey: 'steps' },
  { key: 'body_battery_avg', title: 'Body Battery (avg)', colorKey: 'battery' },
  { key: 'stress_avg', title: 'Stress (avg)', colorKey: 'stress' },
];

const WINDOWS = [
  { label: '7d', n: 7 },
  { label: '30d', n: 30 },
  { label: '90d', n: 90 },
  { label: 'All', n: 0 },
];

export default function TrendGrid({ summaries }: { summaries: DailySummary[] }) {
  const [win, setWin] = useState(30);
  const sliced = win > 0 ? summaries.slice(-win) : summaries;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="h6">Trends</Typography>
        <Typography variant="caption" color="text.secondary">
          {sliced.length} days
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={win}
          onChange={(_e, v) => v != null && setWin(v)}
          sx={{ ml: 'auto' }}
        >
          {WINDOWS.map((w) => (
            <ToggleButton key={w.label} value={w.n} sx={{ px: 1.5, py: 0.25 }}>
              {w.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {METRICS.map((m) => (
          <TrendCard
            key={m.key as string}
            title={m.title}
            unit={m.unit}
            colorKey={m.colorKey}
            data={sliced.map((s) => ({ date: s.date, value: s[m.key] as number | null }))}
          />
        ))}
      </Box>
    </Box>
  );
}
