import Link from 'next/link';
import { Box, Typography, Card } from '@mui/material';
import { listSleep, noteIndex } from '@/lib/queries';
import NoteDot from '@/components/NoteDot';
import { fmtMinutes, fmtDateShort, fmtNum } from '@/lib/format';

export const dynamic = 'force-dynamic';

const COLS = 'minmax(110px,1fr) 70px 96px 80px 80px 70px 64px 64px';
const r = { textAlign: 'right' as const };

export default function SleepPage() {
  const nights = listSleep();
  const notes = noteIndex();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">Sleep</Typography>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 700 }}>
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
              <Typography variant="caption" color="text.secondary">Night</Typography>
              {['Score', 'Duration', 'Deep', 'REM', 'HRV', 'RHR', 'SpO₂'].map((h) => (
                <Typography key={h} variant="caption" color="text.secondary" sx={r}>
                  {h}
                </Typography>
              ))}
            </Box>

            {nights.map((n) => (
              <Box
                key={n.sleep_id}
                component={Link}
                href={`/sleep/${n.sleep_id}`}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {n.calendar_date ? fmtDateShort(n.calendar_date) : '—'}
                  </Typography>
                  <NoteDot summary={notes.summaryFor('sleep', n.calendar_date)} />
                </Box>
                <Typography variant="body2" sx={r}>{fmtNum(n.score_overall_value)}</Typography>
                <Typography variant="body2" sx={r}>
                  {fmtMinutes(n.sleep_time_seconds ? n.sleep_time_seconds / 60 : null)}
                </Typography>
                <Typography variant="body2" sx={r}>
                  {fmtMinutes(n.deep_sleep_seconds ? n.deep_sleep_seconds / 60 : null)}
                </Typography>
                <Typography variant="body2" sx={r}>
                  {fmtMinutes(n.rem_sleep_seconds ? n.rem_sleep_seconds / 60 : null)}
                </Typography>
                <Typography variant="body2" sx={r}>{fmtNum(n.avg_overnight_hrv, 1)}</Typography>
                <Typography variant="body2" sx={r}>{fmtNum(n.resting_heart_rate)}</Typography>
                <Typography variant="body2" sx={r}>{fmtNum(n.average_spo2)}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
