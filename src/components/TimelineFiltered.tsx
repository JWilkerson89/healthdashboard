'use client';
import { useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack } from '@mui/material';
import EventTimeline from '@/components/EventTimeline';
import type { HealthEvent } from '@/lib/queries';
import { humanize } from '@/lib/format';

export default function TimelineFiltered({ events }: { events: HealthEvent[] }) {
  const categories = useMemo(
    () => Array.from(new Set(events.map((e) => e.category))).sort(),
    [events],
  );
  const severities = useMemo(
    () => Array.from(new Set(events.map((e) => e.severity).filter(Boolean) as string[])).sort(),
    [events],
  );
  const [cat, setCat] = useState('all');
  const [sev, setSev] = useState('all');
  const [ongoing, setOngoing] = useState(false);

  const filtered = events.filter(
    (e) =>
      (cat === 'all' || e.category === cat) &&
      (sev === 'all' || e.severity === sev) &&
      (!ongoing || !e.resolved),
  );
  const ongoingCount = events.filter((e) => !e.resolved).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="h4">Timeline</Typography>
        <Typography variant="body2" color="text.secondary">
          {filtered.length} of {events.length} event{events.length === 1 ? '' : 's'}
        </Typography>
      </Box>

      {events.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No events logged yet. Illnesses, injuries, doctor visits, supplement and diet
              changes, milestones, and notable observations will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Chip label="All" size="small" color={cat === 'all' ? 'primary' : 'default'} variant={cat === 'all' ? 'filled' : 'outlined'} onClick={() => setCat('all')} />
            {categories.map((c) => (
              <Chip key={c} label={humanize(c)} size="small" color={cat === c ? 'primary' : 'default'} variant={cat === c ? 'filled' : 'outlined'} onClick={() => setCat(c)} />
            ))}
            <Box sx={{ width: 12 }} />
            {severities.map((sv) => (
              <Chip key={sv} label={humanize(sv)} size="small" color={sev === sv ? 'secondary' : 'default'} variant={sev === sv ? 'filled' : 'outlined'} onClick={() => setSev(sev === sv ? 'all' : sv)} />
            ))}
            {ongoingCount > 0 && (
              <Chip label="Ongoing" size="small" color={ongoing ? 'warning' : 'default'} variant={ongoing ? 'filled' : 'outlined'} onClick={() => setOngoing((o) => !o)} />
            )}
          </Stack>
          <EventTimeline events={filtered} />
        </>
      )}
    </Box>
  );
}
