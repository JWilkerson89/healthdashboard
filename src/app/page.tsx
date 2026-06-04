import { Box, Typography, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import {
  getDailySummaries,
  getLatestSummary,
  listActivities,
  getProfile,
  latestReadiness,
  noteIndex,
  getConsult,
  getTrends,
  openRecommendations,
} from '@/lib/queries';
import StatTile from '@/components/StatTile';
import NoteDot from '@/components/NoteDot';
import ConsultBanner from '@/components/ConsultBanner';
import { STATUS } from '@/lib/colors';
import TrendGrid from '@/components/TrendGrid';
import { ACCENT } from '@/lib/colors';
import {
  fmtNum,
  fmtMinutes,
  fmtDateLong,
  humanize,
  metersToMiles,
  fmtDuration,
  toLocal,
  fmtTime,
} from '@/lib/format';

export const dynamic = 'force-dynamic';

const GRID = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
};

export default function Dashboard() {
  const summaries = getDailySummaries();
  const latest = getLatestSummary();
  const profile = getProfile();
  const recent = listActivities().slice(0, 8);
  const notes = noteIndex();
  const consult = getConsult();
  const consultTrends = consult ? getTrends(consult.date) : [];
  const openRecs = openRecommendations();
  const consultWorst = consultTrends.some((t) => t.status === 'critical')
    ? 'critical'
    : consultTrends.some((t) => t.status === 'warning' || t.status === 'worsening')
      ? 'warning'
      : 'normal';
  const consultAlerts =
    consultTrends.filter((t) =>
      ['critical', 'warning', 'low', 'worsening', 'elevated'].includes(t.status),
    ).length +
    openRecs.filter((r) => r.priority === 'critical' || r.priority === 'high').length;

  const readiness = latestReadiness();
  const readinessColor =
    { HIGH: ACCENT.steps, MODERATE: ACCENT.sleep, LOW: ACCENT.battery, POOR: ACCENT.rhr }[
      (readiness?.level ?? '').toUpperCase()
    ] ?? ACCENT.hrv;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4">
          {profile?.full_name ?? 'Health Dashboard'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {latest ? `Latest: ${fmtDateLong(latest.date)}` : 'No data'}
          {profile?.vo2_max_running
            ? ` · VO₂max ${fmtNum(profile.vo2_max_running)}`
            : ''}
        </Typography>
      </Box>

      {consult && (
        <ConsultBanner
          date={consult.date}
          tone={consult.tone}
          summary={consult.summary}
          accent={STATUS[consultWorst] ?? STATUS.normal}
          alertCount={consultAlerts}
        />
      )}

      {latest && (
        <Box sx={GRID}>
          {readiness && (
            <StatTile label="Readiness" value={fmtNum(readiness.score)} accent={readinessColor} sub={humanize(readiness.level)} />
          )}
          <StatTile label="Sleep Score" value={fmtNum(latest.sleep_score)} accent={ACCENT.sleep} sub={fmtMinutes(latest.sleep_duration_min)} />
          <StatTile label="HRV" value={fmtNum(latest.hrv, 1)} unit="ms" accent={ACCENT.hrv} />
          <StatTile label="Resting HR" value={fmtNum(latest.resting_hr)} unit="bpm" accent={ACCENT.rhr} />
          <StatTile label="Body Battery" value={fmtNum(latest.body_battery_avg)} accent={ACCENT.battery} sub={`max ${fmtNum(latest.body_battery_max)}`} />
          <StatTile label="Steps" value={fmtNum(latest.total_steps)} accent={ACCENT.steps} />
          <StatTile label="Stress" value={fmtNum(latest.stress_avg)} accent={ACCENT.stress} />
        </Box>
      )}

      <TrendGrid summaries={summaries} />

      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Recent Activities
        </Typography>
        <Card>
          <CardContent sx={{ p: 0 }}>
            {recent.map((a, i) => {
              const local = toLocal(a.start_ts, a.timezone_offset_hours);
              const miles = metersToMiles(a.distance);
              return (
                <Box
                  key={a.activity_id}
                  component={Link}
                  href={`/activities/${a.activity_id}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    textDecoration: 'none',
                    color: 'inherit',
                    borderTop: i === 0 ? 'none' : '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {a.activity_name || humanize(a.activity_type_key)}
                      </Typography>
                      <NoteDot summary={notes.summaryFor('activity', local.toISOString().slice(0, 10))} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {fmtDateLong(local.toISOString().slice(0, 10))} · {fmtTime(local)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {fmtDuration(a.duration)}
                      {miles && miles > 0.05 ? ` · ${miles.toFixed(2)} mi` : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.average_hr ? `${Math.round(a.average_hr)} bpm avg` : ''}
                      {a.activity_training_load
                        ? ` · load ${Math.round(a.activity_training_load)}`
                        : ''}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
