import { Box, Typography } from '@mui/material';
import { listBodyComp } from '@/lib/queries';
import StatTile from '@/components/StatTile';
import TrendCard from '@/components/TrendCard';
import { ACCENT } from '@/lib/colors';
import { fmtNum } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function BodyPage() {
  const rows = listBodyComp();
  const latest = rows[rows.length - 1];
  const first = rows[0];
  const pt = (key: 'weight' | 'bf_pct' | 'smm' | 'lean_mass') =>
    rows.map((r) => ({ date: r.date, value: r[key] }));

  const weightDelta =
    latest && first && latest.weight != null && first.weight != null
      ? latest.weight - first.weight
      : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">Body Composition</Typography>

      {latest && (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          }}
        >
          <StatTile
            label="Weight"
            value={fmtNum(latest.weight, 1)}
            unit="lb"
            sub={
              weightDelta != null
                ? `${weightDelta >= 0 ? '+' : ''}${fmtNum(weightDelta, 1)} lb since start`
                : undefined
            }
          />
          <StatTile label="Body Fat" value={fmtNum(latest.bf_pct, 1)} unit="%" accent={ACCENT.stress} />
          <StatTile label="Skeletal Muscle" value={fmtNum(latest.smm, 1)} unit="lb" accent={ACCENT.steps} />
          <StatTile label="Lean Mass" value={fmtNum(latest.lean_mass, 1)} unit="lb" accent={ACCENT.spo2} />
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}
      >
        <TrendCard title="Weight" unit="lb" data={pt('weight')} colorKey="sleep" area={false} />
        <TrendCard title="Body Fat %" unit="%" data={pt('bf_pct')} colorKey="stress" area={false} />
        <TrendCard title="Skeletal Muscle Mass" unit="lb" data={pt('smm')} colorKey="steps" area={false} />
        <TrendCard title="Lean Mass" unit="lb" data={pt('lean_mass')} colorKey="spo2" area={false} />
      </Box>
    </Box>
  );
}
