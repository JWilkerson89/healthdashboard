import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { listActivities, noteSummaryByRecord } from '@/lib/queries';
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

export default function ActivitiesPage() {
  const activities = listActivities();
  const noteMap = noteSummaryByRecord('activity');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">Activities</Typography>
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell align="right">Duration</TableCell>
              <TableCell align="right">Distance</TableCell>
              <TableCell align="right">Avg HR</TableCell>
              <TableCell align="right">Load</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((a) => {
              const local = toLocal(a.start_ts, a.timezone_offset_hours);
              const miles = metersToMiles(a.distance);
              return (
                <TableRow
                  key={a.activity_id}
                  component={Link}
                  href={`/activities/${a.activity_id}`}
                  sx={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    display: 'table-row',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    {fmtDateShort(local.toISOString().slice(0, 10))}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {fmtTime(local)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {a.activity_name || humanize(a.activity_type_key)}
                      <Chip label={humanize(a.activity_type_key)} size="small" variant="outlined" />
                      <NoteDot summary={noteMap.get(a.activity_id)} />
                    </Box>
                  </TableCell>
                  <TableCell align="right">{fmtDuration(a.duration)}</TableCell>
                  <TableCell align="right">
                    {miles && miles > 0.05 ? `${miles.toFixed(2)} mi` : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {a.average_hr ? `${Math.round(a.average_hr)}` : '—'}
                  </TableCell>
                  <TableCell align="right">{fmtNum(a.activity_training_load)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
