import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import SickIcon from '@mui/icons-material/Sick';
import HealingIcon from '@mui/icons-material/Healing';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MedicationIcon from '@mui/icons-material/Medication';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CircleIcon from '@mui/icons-material/Circle';
import type { SvgIconComponent } from '@mui/icons-material';
import type { HealthEvent } from '@/lib/queries';
import { PRIORITY } from '@/lib/colors';
import { fmtDateLong, fmtDateShort, humanize } from '@/lib/format';

const CATEGORY_ICON: Record<string, SvgIconComponent> = {
  illness: SickIcon,
  injury: HealingIcon,
  doctor_visit: MedicalServicesIcon,
  supplement_change: MedicationIcon,
  diet_change: RestaurantIcon,
  milestone: EmojiEventsIcon,
  observation: VisibilityIcon,
};

/** Vertical health-event timeline, newest first. */
export default function EventTimeline({ events }: { events: HealthEvent[] }) {
  return (
    <Box>
      {events.map((e, i) => {
        const Icon = CATEGORY_ICON[e.category] ?? CircleIcon;
        const color = PRIORITY[e.severity ?? 'normal'] ?? '#8b949e';
        const ongoing = !e.resolved;
        return (
          <Box key={e.id} sx={{ display: 'flex', gap: 2 }}>
            {/* Rail */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: color,
                  color: '#000',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
              </Box>
              {i < events.length - 1 && (
                <Box sx={{ flexGrow: 1, width: 2, bgcolor: 'divider', my: 0.5, minHeight: 16 }} />
              )}
            </Box>

            {/* Content */}
            <Card sx={{ flexGrow: 1, mb: 2, borderLeft: '3px solid', borderColor: color }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">
                    {fmtDateLong(e.date)}
                  </Typography>
                  <Chip size="small" variant="outlined" label={humanize(e.category)} />
                  {e.severity && e.severity !== 'normal' && (
                    <Chip size="small" label={humanize(e.severity)} sx={{ bgcolor: color, color: '#000' }} />
                  )}
                  {ongoing ? (
                    <Chip size="small" color="warning" variant="outlined" label="Ongoing" />
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      Resolved{e.resolved_at ? ` ${fmtDateShort(e.resolved_at.slice(0, 10))}` : ''}
                    </Typography>
                  )}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {e.title}
                </Typography>
                {e.details && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    {e.details}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
}
