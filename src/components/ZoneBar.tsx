import { Box, Typography, Tooltip } from '@mui/material';
import { fmtDuration } from '@/lib/format';

const ZONE_COLORS = ['#90caf9', '#69f0ae', '#ffd54f', '#ff8a65', '#ff5252'];
const ZONE_LABELS = ['Z1 Recovery', 'Z2 Aerobic', 'Z3 Tempo', 'Z4 Threshold', 'Z5 Max'];

/** Stacked horizontal bar of HR time-in-zone (seconds per zone). */
export default function ZoneBar({ seconds }: { seconds: (number | null)[] }) {
  const vals = seconds.map((s) => s ?? 0);
  const total = vals.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', height: 28, borderRadius: 1, overflow: 'hidden' }}>
        {vals.map((v, i) => (
          <Tooltip key={i} title={`${ZONE_LABELS[i]} · ${fmtDuration(v)}`}>
            <Box
              sx={{
                width: `${(v / total) * 100}%`,
                bgcolor: ZONE_COLORS[i],
                transition: 'width .2s',
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
        {vals.map((v, i) =>
          v > 0 ? (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ZONE_COLORS[i] }} />
              <Typography variant="caption" color="text.secondary">
                {ZONE_LABELS[i]} {fmtDuration(v)}
              </Typography>
            </Box>
          ) : null,
        )}
      </Box>
    </Box>
  );
}
