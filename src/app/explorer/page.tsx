import { Box, Typography } from '@mui/material';
import { METRICS, getLocalOffset } from '@/lib/queries';
import ExplorerClient from '@/components/ExplorerClient';

export const dynamic = 'force-dynamic';

export default function ExplorerPage() {
  const offset = getLocalOffset();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h4">Explorer</Typography>
        <Typography variant="body2" color="text.secondary">
          Raw minute-level time series — pick a metric and a day.
        </Typography>
      </Box>
      <ExplorerClient metrics={METRICS} offsetHours={offset} />
    </Box>
  );
}
