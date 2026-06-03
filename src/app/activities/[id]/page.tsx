import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  getActivity,
  getActivityPath,
  getStrengthSets,
  getActivitySeries,
} from '@/lib/queries';
import StatTile from '@/components/StatTile';
import ZoneBar from '@/components/ZoneBar';
import ActivityMap from '@/components/ActivityMap';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import { ACCENT } from '@/lib/colors';
import {
  humanize,
  metersToMiles,
  fmtDuration,
  toLocal,
  fmtTime,
  fmtDateLong,
  fmtNum,
  gramsToLb,
} from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ActivityDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = getActivity(Number(id));
  if (!activity) notFound();

  const path = getActivityPath(activity.activity_id);
  const sets = getStrengthSets(activity.activity_id);
  const hr = getActivitySeries(activity.activity_id, 'heart_rate');
  const local = toLocal(activity.start_ts, activity.timezone_offset_hours);
  const miles = metersToMiles(activity.distance);
  const isStrength = sets.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        component={Link}
        href="/activities"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
        color="inherit"
      >
        Activities
      </Button>

      <Box>
        <Typography variant="h4">
          {activity.activity_name || humanize(activity.activity_type_key)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {fmtDateLong(local.toISOString().slice(0, 10))} · {fmtTime(local)}
          {activity.location_name ? ` · ${activity.location_name}` : ''}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        }}
      >
        <StatTile label="Duration" value={fmtDuration(activity.duration)} />
        {miles && miles > 0.05 && (
          <StatTile label="Distance" value={miles.toFixed(2)} unit="mi" />
        )}
        <StatTile label="Avg HR" value={fmtNum(activity.average_hr)} unit="bpm" accent={ACCENT.rhr} />
        <StatTile label="Max HR" value={fmtNum(activity.max_hr)} unit="bpm" accent={ACCENT.rhr} />
        <StatTile label="Calories" value={fmtNum(activity.calories)} />
        <StatTile label="Training Load" value={fmtNum(activity.activity_training_load)} accent={ACCENT.load} />
        {activity.aerobic_training_effect != null && (
          <StatTile
            label="Aerobic TE"
            value={fmtNum(activity.aerobic_training_effect, 1)}
            sub={humanize(activity.training_effect_label)}
          />
        )}
      </Box>

      {path && path.length > 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Route
            </Typography>
            <ActivityMap path={path} />
          </CardContent>
        </Card>
      )}

      {(activity.hr_time_in_zone_1 ?? 0) +
        (activity.hr_time_in_zone_2 ?? 0) +
        (activity.hr_time_in_zone_3 ?? 0) +
        (activity.hr_time_in_zone_4 ?? 0) +
        (activity.hr_time_in_zone_5 ?? 0) >
        0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Heart Rate Zones
            </Typography>
            <ZoneBar
              seconds={[
                activity.hr_time_in_zone_1,
                activity.hr_time_in_zone_2,
                activity.hr_time_in_zone_3,
                activity.hr_time_in_zone_4,
                activity.hr_time_in_zone_5,
              ]}
            />
          </CardContent>
        </Card>
      )}

      {hr.length > 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Heart Rate
            </Typography>
            <TimeSeriesChart
              points={hr}
              color={ACCENT.rhr}
              unit="bpm"
              offsetHours={activity.timezone_offset_hours}
            />
          </CardContent>
        </Card>
      )}

      {isStrength && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Sets
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Exercise</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Reps</TableCell>
                  <TableCell align="right">Weight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sets.map((s) => (
                  <TableRow key={s.set_idx}>
                    <TableCell>{s.set_idx}</TableCell>
                    <TableCell>{humanize(s.exercise_name)}</TableCell>
                    <TableCell>{humanize(s.set_type)}</TableCell>
                    <TableCell align="right">{s.repetition_count ?? '—'}</TableCell>
                    <TableCell align="right">
                      {s.weight ? `${fmtNum(gramsToLb(s.weight), 1)} lb` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
