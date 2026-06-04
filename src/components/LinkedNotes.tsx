'use client';
import { useState } from 'react';
import { Box, Chip, Collapse, Card, CardContent, Divider } from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NoteBody from '@/components/NoteBody';
import { CATEGORY } from '@/lib/colors';
import type { HealthNote } from '@/lib/queries';

/**
 * A category-colored "N notes" chip that expands the linked journal notes
 * inline (client-side toggle), so you can drill into Jarvis's annotations
 * without leaving the asset page.
 */
export default function LinkedNotes({ notes }: { notes: HealthNote[] }) {
  const [open, setOpen] = useState(false);
  if (!notes.length) return null;

  const lead = notes.find((n) => n.priority === 'high') ?? notes[0];
  const color = CATEGORY[lead.category] ?? '#888';
  const label = `${notes.length} linked note${notes.length > 1 ? 's' : ''}`;

  return (
    <Box>
      <Chip
        icon={<StickyNote2Icon sx={{ color: '#000 !important' }} />}
        deleteIcon={
          <ExpandMoreIcon
            sx={{
              color: '#000 !important',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s',
            }}
          />
        }
        onDelete={() => setOpen((o) => !o)}
        onClick={() => setOpen((o) => !o)}
        label={label}
        sx={{ bgcolor: color, color: '#000', fontWeight: 600, cursor: 'pointer' }}
      />
      <Collapse in={open} unmountOnExit>
        <Card sx={{ mt: 1.5, borderLeft: '3px solid', borderColor: color }}>
          <CardContent>
            {notes.map((n, i) => (
              <Box key={n.id}>
                {i > 0 && <Divider sx={{ my: 2 }} />}
                <NoteBody note={n} showLinked={false} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
}
