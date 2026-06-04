import Link from 'next/link';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { fmtDateLong } from '@/lib/format';

/** Compact daily-consult headline on the dashboard, links to the full rollup. */
export default function ConsultBanner({
  date,
  tone,
  summary,
  accent,
  alertCount,
}: {
  date: string;
  tone: string | null;
  summary: string | null;
  accent: string;
  alertCount: number;
}) {
  return (
    <Card
      component={Link}
      href="/consult"
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderLeft: '4px solid',
        borderColor: accent,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="overline" color="text.secondary">
            Consult · {fmtDateLong(date)}
          </Typography>
          {alertCount > 0 && (
            <Chip size="small" label={`${alertCount} need attention`} sx={{ bgcolor: accent, color: '#000' }} />
          )}
          <ChevronRightIcon sx={{ ml: 'auto', color: 'text.secondary' }} />
        </Box>
        {tone && (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {tone}
          </Typography>
        )}
        {summary && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
            {summary}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
