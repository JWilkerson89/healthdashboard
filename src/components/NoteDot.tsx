import { Box, Tooltip } from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { CATEGORY } from '@/lib/colors';
import type { NoteSummary } from '@/lib/queries';

/** Small note indicator for list rows, colored by the linked note's category. */
export default function NoteDot({ summary }: { summary: NoteSummary | undefined }) {
  if (!summary) return null;
  const color = CATEGORY[summary.category] ?? '#888';
  return (
    <Tooltip
      title={`${summary.count} linked note${summary.count > 1 ? 's' : ''}${
        summary.highPriority ? ' · high priority' : ''
      }`}
    >
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <StickyNote2Icon sx={{ fontSize: 16, color }} />
      </Box>
    </Tooltip>
  );
}
