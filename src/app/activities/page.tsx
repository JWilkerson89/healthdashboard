import Link from 'next/link';
import { Box, Typography, Card, Chip } from '@mui/material';
import { listActivities, noteIndex } from '@/lib/queries';
import NoteDot from '@/components/NoteDot';
import {
  humanize,
  metersToMiles,
  fmtDuration,
  toLocal,
  fmtTime,
  fmtDateShort,
  fmtNum,
} from '@/lib/format';

export const dynamic = 'force-dynamic';

// Grid (not <table>) so rows can be <a> links with valid <a><div> nesting.
const COLS = '110px minmax(160px, 1fr) 96px 86px 76px 64px';

const headSx = { textAlign: 'right' as const };

export default function ActivitiesPage() {
  const activities = listActivities();
  const notes = noteIndex();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">Activities</Typography>
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
              <Typography variant="caption" color="text.secondary" sx={headSx}>Duration</Typography>
              <Typography variant="caption" color="text.secondary" sx={headSx}>Distance</Typography>
              <Typography variant="caption" color="text.secondary" sx={headSx}>Avg HR</Typography>
              <Typography variant="caption" color="text.secondary" sx={headSx}>Load</Typography>
            </Box>

            {activities.map((a) => {
              const local = toLocal(a.start_ts, a.timezone_offset_hours);
              const miles = metersToMiles(a.distance);
              return (
                <Box
                  key={a.activity_id}
                  component={Link}
                  href={`/activities/${a.activity_id}`}
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
                    <Typography variant="caption" color="text.secondary">
                      {fmtTime(local)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {a.activity_name || humanize(a.activity_type_key)}
                    </Typography>
                    <Chip label={humanize(a.activity_type_key)} size="small" variant="outlined" />
                    <NoteDot summary={notes.summaryFor('activity', local.toISOString().slice(0, 10))} />
                  </Box>
                  <Typography variant="body2" sx={headSx}>{fmtDuration(a.duration)}</Typography>
                  <Typography variant="body2" sx={headSx}>
                    {miles && miles > 0.05 ? `${miles.toFixed(2)} mi` : '—'}
                  </Typography>
                  <Typography variant="body2" sx={headSx}>
                    {a.average_hr ? Math.round(a.average_hr) : '—'}
                  </Typography>
                  <Typography variant="body2" sx={headSx}>{fmtNum(a.activity_training_load)}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
