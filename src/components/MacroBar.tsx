import { Box, Typography, Tooltip } from '@mui/material';
import { MACRO } from '@/lib/colors';
import { fmtNum } from '@/lib/format';

// Atwater factors: protein/carbs 4 kcal/g, fat 9 kcal/g.
const KCAL = { protein: 4, carbs: 4, fat: 9 } as const;

/**
 * Stacked bar showing where the day's calories come from (by macro), with
 * gram labels in the legend. Widths are calorie-weighted, not gram-weighted.
 */
export default function MacroBar({
  protein,
  fat,
  carbs,
}: {
  protein: number;
  fat: number;
  carbs: number;
}) {
  const kcal = {
    protein: protein * KCAL.protein,
    fat: fat * KCAL.fat,
    carbs: carbs * KCAL.carbs,
  };
  const total = kcal.protein + kcal.fat + kcal.carbs;
  if (total <= 0) return null;

  const segs = [
    { key: 'protein', label: 'Protein', grams: protein, kcal: kcal.protein, color: MACRO.protein },
    { key: 'fat', label: 'Fat', grams: fat, kcal: kcal.fat, color: MACRO.fat },
    { key: 'carbs', label: 'Carbs', grams: carbs, kcal: kcal.carbs, color: MACRO.carbs },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', height: 22, borderRadius: 1, overflow: 'hidden' }}>
        {segs.map((s) => (
          <Tooltip
            key={s.key}
            title={`${s.label}: ${fmtNum(s.grams)} g · ${Math.round((s.kcal / total) * 100)}%`}
          >
            <Box sx={{ width: `${(s.kcal / total) * 100}%`, bgcolor: s.color }} />
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
        {segs.map((s) => (
          <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
            <Typography variant="caption" color="text.secondary">
              {s.label} {fmtNum(s.grams)} g · {Math.round((s.kcal / total) * 100)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
