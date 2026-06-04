'use client';
import { useState, useMemo } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import NoteBody from '@/components/NoteBody';
import { CATEGORY } from '@/lib/colors';
import { humanize } from '@/lib/format';
import type { HealthNote } from '@/lib/queries';

export default function JournalNotes({ notes }: { notes: HealthNote[] }) {
  const categories = useMemo(
    () => Array.from(new Set(notes.map((n) => n.category))).sort(),
    [notes],
  );
  const [cat, setCat] = useState('all');
  const [highOnly, setHighOnly] = useState(false);

  const filtered = notes.filter(
    (n) => (cat === 'all' || n.category === cat) && (!highOnly || n.priority === 'high'),
  );
  const highCount = notes.filter((n) => n.priority === 'high').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Chip label="All" size="small" color={cat === 'all' ? 'primary' : 'default'} variant={cat === 'all' ? 'filled' : 'outlined'} onClick={() => setCat('all')} />
        {categories.map((c) => (
          <Chip key={c} label={humanize(c)} size="small" color={cat === c ? 'primary' : 'default'} variant={cat === c ? 'filled' : 'outlined'} onClick={() => setCat(c)} />
        ))}
        {highCount > 0 && (
          <Chip label="High priority" size="small" color={highOnly ? 'error' : 'default'} variant={highOnly ? 'filled' : 'outlined'} onClick={() => setHighOnly((h) => !h)} />
        )}
      </Stack>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No notes match.
        </Typography>
      ) : (
        filtered.map((n) => (
          <Card
            key={n.id}
            id={`note-${n.id}`}
            sx={{ borderLeft: '3px solid', borderColor: CATEGORY[n.category], scrollMarginTop: 80 }}
          >
            <CardContent>
              <NoteBody note={n} />
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
