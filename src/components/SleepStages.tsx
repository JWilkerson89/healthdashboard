import { Box, Typography } from '@mui/material';
import type { SleepStage } from '@/lib/queries';
import { toLocal, fmtTime } from '@/lib/format';

// 0=Deep, 1=Light, 2=REM, 3=Awake. Rows ordered Awake→REM→Light→Deep.
const ROWS = [
  { stage: 3, label: 'Awake', color: '#ff8a65' },
  { stage: 2, label: 'REM', color: '#7c4dff' },
  { stage: 1, label: 'Light', color: '#4fc3f7' },
  { stage: 0, label: 'Deep', color: '#1565c0' },
];

/** Hypnogram: stage intervals laid out on a shared time axis. */
export default function SleepStages({
  levels,
  offsetHours,
}: {
  levels: SleepStage[];
  offsetHours: number;
}) {
  if (!levels.length) return null;
  const ms = (s: string) => Date.parse(s.replace(' ', 'T') + 'Z');
  const min = Math.min(...levels.map((l) => ms(l.start_ts)));
  const max = Math.max(...levels.map((l) => ms(l.end_ts)));
  const span = max - min || 1;
  const rowH = 26;

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        {ROWS.map((row, ri) => (
          <Box
            key={row.stage}
            sx={{
              position: 'relative',
              height: rowH,
              display: 'flex',
              alignItems: 'center',
              borderTop: ri === 0 ? '1px solid' : 'none',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ width: 48, flexShrink: 0 }}
            >
              {row.label}
            </Typography>
            <Box sx={{ position: 'relative', flexGrow: 1, height: '100%' }}>
              {levels
                .filter((l) => l.stage === row.stage)
                .map((l, i) => {
                  const left = ((ms(l.start_ts) - min) / span) * 100;
                  const width = ((ms(l.end_ts) - ms(l.start_ts)) / span) * 100;
                  return (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${Math.max(width, 0.3)}%`,
                        top: 5,
                        bottom: 5,
                        bgcolor: row.color,
                        borderRadius: 0.5,
                      }}
                    />
                  );
                })}
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pl: '48px', mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {fmtTime(toLocal(levels[0].start_ts, offsetHours))}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fmtTime(toLocal(levels[levels.length - 1].end_ts, offsetHours))}
        </Typography>
      </Box>
    </Box>
  );
}
