import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  getConsult,
  getSnapshot,
  getTrends,
  openRecommendations,
  consultDates,
} from '@/lib/queries';
import StatTile from '@/components/StatTile';
import Markdown from '@/components/Markdown';
import { STATUS, PRIORITY } from '@/lib/colors';
import { fmtDateLong, fmtDateShort, fmtNum, humanize } from '@/lib/format';

export const dynamic = 'force-dynamic';

const ALERT_TREND = new Set(['critical', 'warning', 'low', 'worsening', 'elevated']);

export default async function ConsultPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const consult = getConsult(date);
  const dates = consultDates();

  if (!consult) {
    return (
      <Box>
        <Typography variant="h4">Consult</Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No consult recorded yet.
        </Typography>
      </Box>
    );
  }

  const snapshot = getSnapshot(consult.date);
  const trends = getTrends(consult.date);
  const openRecs = openRecommendations();

  // Banner tint follows the worst trend status for the day.
  const worst = trends.find((t) => t.status === 'critical')
    ? 'critical'
    : trends.find((t) => t.status === 'warning' || t.status === 'worsening')
      ? 'warning'
      : 'normal';
  const toneColor = STATUS[worst] ?? STATUS.normal;

  const alertTrends = trends.filter((t) => ALERT_TREND.has(t.status));
  const alertRecs = openRecs.filter((r) => r.priority === 'critical' || r.priority === 'high');
  const hasAlerts = alertTrends.length > 0 || alertRecs.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4">Consult</Typography>
        <Typography variant="body2" color="text.secondary">
          {fmtDateLong(consult.date)}
        </Typography>
        {dates.length > 1 && (
          <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto', flexWrap: 'wrap' }}>
            {dates.map((d) => (
              <Chip
                key={d}
                component={Link}
                href={`/consult?date=${d}`}
                clickable
                size="small"
                label={fmtDateShort(d)}
                variant={d === consult.date ? 'filled' : 'outlined'}
                color={d === consult.date ? 'primary' : 'default'}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Tone banner */}
      {consult.tone && (
        <Card sx={{ borderLeft: '4px solid', borderColor: toneColor }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Tone
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {consult.tone}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Summary + critical findings */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        {consult.summary && (
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Summary
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                {consult.summary}
              </Typography>
            </CardContent>
          </Card>
        )}
        {consult.critical_findings && (
          <Card sx={{ borderLeft: '4px solid', borderColor: STATUS.critical }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: STATUS.critical }}>
                Critical findings
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                {consult.critical_findings}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Long-form narrative if present */}
      {consult.full_body && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Full Consult
            </Typography>
            <Markdown>{consult.full_body}</Markdown>
          </CardContent>
        </Card>
      )}

      {/* Needs attention */}
      {hasAlerts && (
        <Card sx={{ border: '1px solid', borderColor: STATUS.warning }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <WarningAmberIcon sx={{ color: STATUS.warning }} />
              <Typography variant="h6">Needs Attention</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {alertTrends.map((t) => (
                <Box key={`t${t.id}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Chip
                    size="small"
                    label={humanize(t.status)}
                    sx={{ bgcolor: STATUS[t.status] ?? '#888', color: '#000', minWidth: 90 }}
                  />
                  <Box>
                    <Typography variant="body2">
                      <strong>{humanize(t.metric)}</strong> · {fmtNum(t.value, t.value && t.value % 1 ? 1 : 0)}
                      {t.unit ? ` ${t.unit}` : ''}
                    </Typography>
                    {t.note && (
                      <Typography variant="caption" color="text.secondary">
                        {t.note}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
              {alertRecs.map((r) => (
                <Box key={`r${r.id}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Chip
                    size="small"
                    label={humanize(r.priority)}
                    sx={{ bgcolor: PRIORITY[r.priority] ?? '#888', color: '#000', minWidth: 90 }}
                  />
                  <Box>
                    <Typography variant="body2">{r.recommendation}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {humanize(r.category)} · due {fmtDateShort(r.date)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Metric grid */}
      {trends.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Metrics
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            }}
          >
            {trends.map((t) => (
              <StatTile
                key={t.id}
                label={`${humanize(t.metric)} · ${humanize(t.status)}`}
                value={fmtNum(t.value, t.value && t.value % 1 ? 1 : 0)}
                unit={t.unit ?? undefined}
                accent={STATUS[t.status] ?? undefined}
                sub={t.note ?? undefined}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Training + supplement context */}
      {snapshot && (snapshot.training_rec || snapshot.supplement_note) && (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          {snapshot.training_rec && (
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Training Recommendation
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {snapshot.training_rec}
                </Typography>
              </CardContent>
            </Card>
          )}
          {snapshot.supplement_note && (
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Supplements
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {snapshot.supplement_note}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Recommendations */}
      {openRecs.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Open Recommendations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {openRecs.map((r, i) => (
                <Box key={r.id}>
                  {i > 0 && <Divider sx={{ mb: 1 }} />}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, mt: 0.3, color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">{r.recommendation}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label={humanize(r.priority)}
                          sx={{ bgcolor: PRIORITY[r.priority] ?? '#888', color: '#000' }}
                        />
                        <Chip size="small" variant="outlined" label={humanize(r.category)} />
                        <Typography variant="caption" color="text.secondary">
                          due {fmtDateShort(r.date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
