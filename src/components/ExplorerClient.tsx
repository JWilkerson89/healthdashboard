'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import TimeSeriesChart, { type TimePoint } from '@/components/TimeSeriesChart';
import type { MetricDef } from '@/lib/queries';
import { ACCENT } from '@/lib/colors';

const COLORS: Record<string, string> = {
  heart_rate: ACCENT.rhr,
  stress: ACCENT.stress,
  body_battery: ACCENT.battery,
  respiration: ACCENT.spo2,
  steps: ACCENT.steps,
  intensity_minutes: ACCENT.load,
  spo2: ACCENT.spo2,
  hrv: ACCENT.hrv,
};

export default function ExplorerClient({
  metrics,
  offsetHours,
}: {
  metrics: MetricDef[];
  offsetHours: number;
}) {
  const [metric, setMetric] = useState(metrics[0]?.key ?? 'heart_rate');
  const [dates, setDates] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [points, setPoints] = useState<TimePoint[]>([]);
  const [def, setDef] = useState<MetricDef | null>(metrics[0] ?? null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (m: string, d?: string) => {
    setLoading(true);
    try {
      const url = new URL('/api/explorer', window.location.origin);
      url.searchParams.set('metric', m);
      if (d) url.searchParams.set('date', d);
      const res = await fetch(url);
      const json = await res.json();
      setDef(json.def);
      setDates(json.dates ?? []);
      setDate(json.date ?? '');
      setPoints(json.points ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + whenever the metric changes (resets to its latest date).
  useEffect(() => {
    load(metric);
  }, [metric, load]);

  const color = COLORS[metric] ?? ACCENT.hrv;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Metric"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          sx={{ minWidth: 200 }}
          size="small"
        >
          {metrics.map((m) => (
            <MenuItem key={m.key} value={m.key}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Day"
          value={date}
          onChange={(e) => load(metric, e.target.value)}
          sx={{ minWidth: 180 }}
          size="small"
          disabled={!dates.length}
        >
          {dates.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="h6">{def?.label}</Typography>
            <Typography variant="caption" color="text.secondary">
              {def?.unit} · {points.length} samples
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ height: 300, display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TimeSeriesChart
              points={points}
              color={color}
              unit={def?.unit}
              offsetHours={offsetHours}
              height={320}
              area={metric === 'body_battery' || metric === 'spo2'}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
