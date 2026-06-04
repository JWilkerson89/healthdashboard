import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  latestReadiness,
  readinessTrend,
  latestTrainingLoad,
  trainingLoadTrend,
  vo2MaxTrend,
  latestRacePredictions,
  personalRecords,
} from '@/lib/queries';
import StatTile from '@/components/StatTile';
import TrendCard from '@/components/TrendCard';
import DualLineCard from '@/components/DualLineCard';
import { ACCENT } from '@/lib/colors';
import { fmtNum, fmtDuration, fmtMinutes, fmtPR, humanize, fmtDateShort } from '@/lib/format';

export const dynamic = 'force-dynamic';

function levelColor(level: string | null): string {
  switch ((level ?? '').toUpperCase()) {
    case 'HIGH':
      return ACCENT.steps;
    case 'MODERATE':
      return ACCENT.sleep;
    case 'LOW':
      return ACCENT.battery;
    case 'POOR':
      return ACCENT.rhr;
    default:
      return ACCENT.hrv;
  }
}

function feedbackColor(fb: string | null): 'success' | 'info' | 'warning' | 'default' {
  const f = (fb ?? '').toUpperCase();
  if (f.includes('VERY_GOOD') || f.includes('GOOD')) return 'success';
  if (f.includes('MODERATE')) return 'info';
  if (f.includes('POOR') || f.includes('LOW')) return 'warning';
  return 'default';
}

export default function TrainingPage() {
  const readiness = latestReadiness();
  const rTrend = readinessTrend();
  const load = latestTrainingLoad();
  const loadTrend = trainingLoadTrend();
  const vo2 = vo2MaxTrend();
  const race = latestRacePredictions();
  const prs = personalRecords();

  const factors = readiness
    ? [
        { name: 'Sleep', percent: readiness.sleep_score_factor_percent, fb: readiness.sleep_score_factor_feedback },
        { name: 'Recovery', percent: readiness.recovery_time_factor_percent, fb: readiness.recovery_time_factor_feedback },
        { name: 'HRV', percent: readiness.hrv_factor_percent, fb: readiness.hrv_factor_feedback },
        { name: 'ACWR', percent: readiness.acwr_factor_percent, fb: readiness.acwr_factor_feedback },
        { name: 'Stress History', percent: readiness.stress_history_factor_percent, fb: readiness.stress_history_factor_feedback },
        { name: 'Sleep History', percent: readiness.sleep_history_factor_percent, fb: readiness.sleep_history_factor_feedback },
      ].filter((f) => f.percent != null)
    : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">Training &amp; Performance</Typography>

      {/* Readiness */}
      {readiness && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6">Training Readiness</Typography>
              <Typography variant="h4" sx={{ color: levelColor(readiness.level) }}>
                {fmtNum(readiness.score)}
              </Typography>
              <Chip label={humanize(readiness.level)} sx={{ bgcolor: levelColor(readiness.level), color: '#000' }} size="small" />
              <Typography variant="body2" color="text.secondary">
                Recovery {fmtMinutes(readiness.recovery_time)}
              </Typography>
            </Box>
            {readiness.feedback_long && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {humanize(readiness.feedback_long)}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {factors.map((f) => (
                <Box key={f.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" sx={{ width: 110, flexShrink: 0 }}>
                    {f.name}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(f.percent ?? 0, 100)}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                  />
                  <Chip size="small" label={humanize(f.fb)} color={feedbackColor(f.fb)} variant="outlined" sx={{ width: 110, flexShrink: 0 }} />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Training load */}
      {load && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h6">Training Load &amp; Status</Typography>
            <Chip
              label={humanize((load.training_status_feedback_phrase ?? '').replace(/_\d+$/, ''))}
              size="small"
              sx={{ bgcolor: ACCENT.load, color: '#000' }}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              mb: 2,
            }}
          >
            <StatTile label="Acute Load" value={fmtNum(load.daily_training_load_acute)} sub="7-day" accent={ACCENT.rhr} />
            <StatTile label="Chronic Load" value={fmtNum(load.daily_training_load_chronic)} sub="28-day" accent={ACCENT.sleep} />
            <StatTile label="ACWR" value={fmtNum(load.acwr_percent)} unit="%" sub={humanize(load.acwr_status)} accent={ACCENT.battery} />
          </Box>
          {loadTrend.length > 1 && (
            <DualLineCard
              title="Acute vs Chronic Load"
              dates={loadTrend.map((d) => d.date)}
              series={[
                { label: 'Acute (7d)', color: ACCENT.rhr, data: loadTrend.map((d) => d.acute) },
                { label: 'Chronic (28d)', color: ACCENT.sleep, data: loadTrend.map((d) => d.chronic) },
              ]}
            />
          )}
        </Box>
      )}

      {/* VO2max + race predictions */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}
      >
        {vo2.length > 1 && (
          <TrendCard title="VO₂ Max" data={vo2} color={ACCENT.steps} area={false} />
        )}
        {race && (
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Race Predictions
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {[
                  ['5K', race.time_5k],
                  ['10K', race.time_10k],
                  ['Half', race.time_half_marathon],
                  ['Marathon', race.time_marathon],
                ].map(([label, secs]) => (
                  <Box key={label as string}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h6">{fmtDuration(secs as number | null)}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Personal records */}
      {prs.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Personal Records
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Record</TableCell>
                  <TableCell align="right">Best</TableCell>
                  <TableCell align="right">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prs.map((pr) => (
                  <TableRow key={pr.type_id}>
                    <TableCell>{pr.label}</TableCell>
                    <TableCell align="right">{fmtPR(pr.label, pr.value)}</TableCell>
                    <TableCell align="right">{fmtDateShort(pr.timestamp.slice(0, 10))}</TableCell>
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
