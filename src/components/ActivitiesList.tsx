'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Box, Typography, Card, Chip, Stack } from '@mui/material';
import NoteDot from '@/components/NoteDot';
import type { ActivityListItem, NoteSummary } from '@/lib/queries';
import {
  humanize,
  metersToMiles,
  fmtDuration,
  toLocal,
  fmtTime,
  fmtDateShort,
  fmtNum,
} from '@/lib/format';

const COLS = '110px minmax(160px, 1fr) 96px 86px 76px 64px';
const r = { textAlign: 'right' as const };

export default function ActivitiesList({
  activities,
  noteSummaries,
}: {
  activities: ActivityListItem[];
  noteSummaries: Record<number, NoteSummary | undefined>;
}) {
  const types = useMemo(
    () => Array.from(new Set(activities.map((a) => a.activity_type_key))).sort(),
    [activities],
  );
  const [type, setType] = useState<string>('all');
  const rows = type === 'all' ? activities : activities.filter((a) => a.activity_type_key === type);

  // j/k to move focus through rows (Enter opens via the native link), / to filters.
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const idxRef = useRef(-1);
  useEffect(() => {
    idxRef.current = -1;
  }, [type]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        const n = rows.length;
        if (!n) return;
        idxRef.current =
          e.key === 'j'
            ? Math.min(idxRef.current + 1, n - 1)
            : Math.max(idxRef.current - 1, 0);
        rowRefs.current[idxRef.current]?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        (filterRef.current?.querySelector('.MuiChip-root') as HTMLElement)?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rows.length]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">Activities</Typography>

      <Stack ref={filterRef} direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="All"
          size="small"
          color={type === 'all' ? 'primary' : 'default'}
          variant={type === 'all' ? 'filled' : 'outlined'}
          onClick={() => setType('all')}
        />
        {types.map((t) => (
          <Chip
            key={t}
            label={humanize(t)}
            size="small"
            color={type === t ? 'primary' : 'default'}
            variant={type === t ? 'filled' : 'outlined'}
            onClick={() => setType(t)}
          />
        ))}
      </Stack>

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 640 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: COLS,
                gap: 1.5,
                px: 2,
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">Date</Typography>
              <Typography variant="caption" color="text.secondary">Activity</Typography>
              <Typography variant="caption" color="text.secondary" sx={r}>Duration</Typography>
              <Typography variant="caption" color="text.secondary" sx={r}>Distance</Typography>
              <Typography variant="caption" color="text.secondary" sx={r}>Avg HR</Typography>
              <Typography variant="caption" color="text.secondary" sx={r}>Load</Typography>
            </Box>

            {rows.map((a, i) => {
              const local = toLocal(a.start_ts, a.timezone_offset_hours);
              const miles = metersToMiles(a.distance);
              return (
                <Box
                  key={a.activity_id}
                  component={Link}
                  href={`/activities/${a.activity_id}`}
                  ref={(el: HTMLAnchorElement | null) => {
                    rowRefs.current[i] = el;
                  }}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: COLS,
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box>
                    <Typography variant="body2">{fmtDateShort(local.toISOString().slice(0, 10))}</Typography>
                    <Typography variant="caption" color="text.secondary">{fmtTime(local)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {a.activity_name || humanize(a.activity_type_key)}
                    </Typography>
                    <Chip label={humanize(a.activity_type_key)} size="small" variant="outlined" />
                    <NoteDot summary={noteSummaries[a.activity_id]} />
                  </Box>
                  <Typography variant="body2" sx={r}>{fmtDuration(a.duration)}</Typography>
                  <Typography variant="body2" sx={r}>
                    {miles && miles > 0.05 ? `${miles.toFixed(2)} mi` : '—'}
                  </Typography>
                  <Typography variant="body2" sx={r}>
                    {a.average_hr ? Math.round(a.average_hr) : '—'}
                  </Typography>
                  <Typography variant="body2" sx={r}>{fmtNum(a.activity_training_load)}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
