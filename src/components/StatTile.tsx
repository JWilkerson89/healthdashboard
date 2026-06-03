import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatTile({
  label,
  value,
  unit,
  accent,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
  sub?: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography variant="h4" sx={{ color: accent ?? 'text.primary' }}>
            {value}
          </Typography>
          {unit && (
            <Typography variant="body2" color="text.secondary">
              {unit}
            </Typography>
          )}
        </Box>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
