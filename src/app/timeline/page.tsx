import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { listHealthEvents } from '@/lib/queries';
import EventTimeline from '@/components/EventTimeline';

export const dynamic = 'force-dynamic';

export default function TimelinePage() {
  const events = listHealthEvents();
  const ongoing = events.filter((e) => !e.resolved).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="h4">Timeline</Typography>
        <Typography variant="body2" color="text.secondary">
          {events.length} event{events.length === 1 ? '' : 's'}
          {ongoing > 0 ? ` · ${ongoing} ongoing` : ''}
        </Typography>
      </Box>

      {events.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No events logged yet. Illnesses, injuries, doctor visits, supplement and
              diet changes, milestones, and notable observations will appear here as a
              chronological timeline.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <EventTimeline events={events} />
      )}
    </Box>
  );
}
