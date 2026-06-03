import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  getSleep,
  getSleepLevels,
  getSleepSeries,
} from '@/lib/queries';
import StatTile from '@/components/StatTile';
import SleepStages from '@/components/SleepStages';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import { ACCENT } from '@/lib/colors';
import { fmtMinutes, fmtNum, fmtDateLong, toLocal, fmtTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function SleepDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = getSleep(Number(id));
  if (!s) notFound();

  const levels = getSleepLevels(s.sleep_id);
  const hrv = getSleepSeries(s.sleep_id, 'hrv');
  const spo2 = getSleepSeries(s.sleep_id, 'spo2');
  const off = s.timezone_offset_hours;

  const hrvStatus = s.hrv_status as string | null;
  const feedback = s.sleep_score_feedback as string | null;
  const lowestSpo2 = s.lowest_spo2 as number | null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        component={Link}
        href="/sleep"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
        color="inherit"
      >
        Sleep
      </Button>

      <Box>
        <Typography variant="h4">
          {s.calendar_date ? fmtDateLong(s.calendar_date) : 'Sleep'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {fmtTime(toLocal(s.start_ts, off))} – {fmtTime(toLocal(s.end_ts, off))}
          {feedback ? ` · ${feedback.replace(/_/g, ' ').toLowerCase()}` : ''}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        }}
      >
        <StatTile label="Score" value={fmtNum(s.score_overall_value)} accent={ACCENT.sleep} />
        <StatTile label="Asleep" value={fmtMinutes(s.sleep_time_seconds ? s.sleep_time_seconds / 60 : null)} />
        <StatTile label="Deep" value={fmtMinutes(s.deep_sleep_seconds ? s.deep_sleep_seconds / 60 : null)} />
        <StatTile label="REM" value={fmtMinutes(s.rem_sleep_seconds ? s.rem_sleep_seconds / 60 : null)} accent={ACCENT.hrv} />
        <StatTile label="Awake" value={fmtMinutes(s.awake_sleep_seconds ? s.awake_sleep_seconds / 60 : null)} />
        <StatTile label="HRV" value={fmtNum(s.avg_overnight_hrv, 1)} unit="ms" accent={ACCENT.hrv} sub={hrvStatus ?? undefined} />
        <StatTile label="Resting HR" value={fmtNum(s.resting_heart_rate)} unit="bpm" accent={ACCENT.rhr} />
        <StatTile label="SpO₂ avg" value={fmtNum(s.average_spo2)} unit="%" accent={ACCENT.spo2} sub={lowestSpo2 ? `low ${lowestSpo2}` : undefined} />
      </Box>

      {levels.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sleep Stages
            </Typography>
            <SleepStages levels={levels} offsetHours={off} />
          </CardContent>
        </Card>
      )}

      {hrv.length > 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Overnight HRV
            </Typography>
            <TimeSeriesChart points={hrv} color={ACCENT.hrv} unit="ms" offsetHours={off} area />
          </CardContent>
        </Card>
      )}

      {spo2.length > 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Overnight SpO₂
            </Typography>
            <TimeSeriesChart points={spo2} color={ACCENT.spo2} unit="%" offsetHours={off} area />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
