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
  getActivityLaps,
  noteIndex,
} from '@/lib/queries';
import LinkedNotes from '@/components/LinkedNotes';
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

/** Pace from a lap's distance (m) and time (s), as "M:SS /mi" or "—". */
function lapPace(distM: number | undefined, timeS: number | undefined): string {
  if (!distM || distM < 50 || !timeS) return '—';
  const secPerMile = timeS / (distM / 1609.344);
  return `${fmtDuration(secPerMile)} /mi`;
}

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
  const laps = getActivityLaps(activity.activity_id);
  const activityDate = toLocal(activity.start_ts, activity.timezone_offset_hours)
    .toISOString()
    .slice(0, 10);
  const notes = noteIndex().notesFor('activity', activityDate);
  // Show laps only when there's more than one and they carry useful signal.
  const showLaps =
    laps.length > 1 &&
    laps.some((l) => (l.metrics.total_distance ?? 0) > 0 || (l.metrics.avg_heart_rate ?? 0) > 0);
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

      {notes.length > 0 && <LinkedNotes notes={notes} />}

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
              colorKey="rhr"
              unit="bpm"
              offsetHours={activity.timezone_offset_hours}
            />
          </CardContent>
        </Card>
      )}

      {showLaps && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Laps
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell align="right">Distance</TableCell>
                  <TableCell align="right">Time</TableCell>
                  <TableCell align="right">Pace</TableCell>
                  <TableCell align="right">Avg HR</TableCell>
                  <TableCell align="right">Max HR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {laps.map((l) => {
                  const dist = l.metrics.total_distance;
                  const time = l.metrics.total_timer_time ?? l.metrics.total_elapsed_time;
                  const mi = metersToMiles(dist);
                  return (
                    <TableRow key={l.lap_idx}>
                      <TableCell>{l.lap_idx + 1}</TableCell>
                      <TableCell align="right">
                        {mi && mi > 0.01 ? `${mi.toFixed(2)} mi` : '—'}
                      </TableCell>
                      <TableCell align="right">{fmtDuration(time)}</TableCell>
                      <TableCell align="right">{lapPace(dist, time)}</TableCell>
                      <TableCell align="right">
                        {l.metrics.avg_heart_rate ? Math.round(l.metrics.avg_heart_rate) : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {l.metrics.max_heart_rate ? Math.round(l.metrics.max_heart_rate) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
