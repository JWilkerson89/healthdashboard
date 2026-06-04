import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { listMeals, dailyNutrition, noteIndex } from '@/lib/queries';
import StatTile from '@/components/StatTile';
import MacroBar from '@/components/MacroBar';
import TrendCard from '@/components/TrendCard';
import NoteDot from '@/components/NoteDot';
import LinkedNotes from '@/components/LinkedNotes';
import { ACCENT, MACRO } from '@/lib/colors';
import { fmtNum, fmtDateLong, humanize } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function NutritionPage() {
  const days = dailyNutrition(); // most recent first
  const meals = listMeals();
  const latest = days[0];
  const notes = noteIndex();

  const caloriesTrend = [...days]
    .reverse()
    .map((d) => ({ date: d.date, value: d.calories }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4">Nutrition</Typography>
        <Typography variant="body2" color="text.secondary">
          {days.length
            ? `${meals.length} meals logged across ${days.length} day${days.length > 1 ? 's' : ''}`
            : 'No meals logged yet'}
        </Typography>
      </Box>

      {latest && (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          }}
        >
          <StatTile label="Latest Day" value={fmtNum(latest.calories)} unit="cal" accent={ACCENT.calories} sub={fmtDateLong(latest.date)} />
          <StatTile label="Protein" value={fmtNum(latest.protein)} unit="g" accent={MACRO.protein} />
          <StatTile label="Fat" value={fmtNum(latest.fat)} unit="g" accent={MACRO.fat} />
          <StatTile label="Carbs" value={fmtNum(latest.carbs)} unit="g" accent={MACRO.carbs} />
        </Box>
      )}

      {days.length >= 3 && (
        <Box sx={{ maxWidth: 480 }}>
          <TrendCard title="Calories / day" unit="cal" data={caloriesTrend} colorKey="calories" area={false} />
        </Box>
      )}

      {days.map((d) => {
        const dayMeals = meals.filter((m) => m.date === d.date);
        return (
          <Card key={d.date}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h6">{fmtDateLong(d.date)}</Typography>
                <Typography variant="h6" sx={{ color: ACCENT.calories }}>
                  {fmtNum(d.calories)} cal
                </Typography>
                <Chip size="small" variant="outlined" label={`${d.meals} meal${d.meals > 1 ? 's' : ''}`} />
                <NoteDot summary={notes.summaryFor('meal', d.date)} />
              </Box>

              {notes.notesFor('meal', d.date).length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <LinkedNotes notes={notes.notesFor('meal', d.date)} />
                </Box>
              )}

              <MacroBar protein={d.protein} fat={d.fat} carbs={d.carbs} />

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {dayMeals.map((m) => (
                  <Box
                    key={m.id}
                    sx={{
                      pt: 1.5,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="subtitle2">{humanize(m.meal_type)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fmtNum(m.calories)} cal · {fmtNum(m.protein)}P / {fmtNum(m.fat)}F / {fmtNum(m.carbs)}C
                      </Typography>
                    </Box>
                    {m.notes && (
                      <Typography variant="caption" color="text.secondary">
                        {m.notes}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
