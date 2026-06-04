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
} from '@mui/material';
import { listSleep, noteSummaryByRecord } from '@/lib/queries';
import NoteDot from '@/components/NoteDot';
import { fmtMinutes, fmtDateShort, fmtNum } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function SleepPage() {
  const nights = listSleep();
  const noteMap = noteSummaryByRecord('sleep');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">Sleep</Typography>
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Night</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="right">Duration</TableCell>
              <TableCell align="right">Deep</TableCell>
              <TableCell align="right">REM</TableCell>
              <TableCell align="right">HRV</TableCell>
              <TableCell align="right">RHR</TableCell>
              <TableCell align="right">SpO₂</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nights.map((n) => (
              <TableRow
                key={n.sleep_id}
                component={Link}
                href={`/sleep/${n.sleep_id}`}
                sx={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'table-row',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {n.calendar_date ? fmtDateShort(n.calendar_date) : '—'}
                    <NoteDot summary={noteMap.get(n.sleep_id)} />
                  </Box>
                </TableCell>
                <TableCell align="right">{fmtNum(n.score_overall_value)}</TableCell>
                <TableCell align="right">
                  {fmtMinutes(n.sleep_time_seconds ? n.sleep_time_seconds / 60 : null)}
                </TableCell>
                <TableCell align="right">
                  {fmtMinutes(n.deep_sleep_seconds ? n.deep_sleep_seconds / 60 : null)}
                </TableCell>
                <TableCell align="right">
                  {fmtMinutes(n.rem_sleep_seconds ? n.rem_sleep_seconds / 60 : null)}
                </TableCell>
                <TableCell align="right">{fmtNum(n.avg_overnight_hrv, 1)}</TableCell>
                <TableCell align="right">{fmtNum(n.resting_heart_rate)}</TableCell>
                <TableCell align="right">{fmtNum(n.average_spo2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
