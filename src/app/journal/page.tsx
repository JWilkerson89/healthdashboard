import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { listHealthNotes, listSupplements, type Supplement } from '@/lib/queries';
import NoteBody from '@/components/NoteBody';
import { CATEGORY } from '@/lib/colors';
import { humanize } from '@/lib/format';

export const dynamic = 'force-dynamic';

const TIMING_LABEL: Record<string, string> = {
  morning: 'Morning',
  throughout: 'Throughout the day',
  evening: 'Evening',
};

function SupplementStack({ supplements }: { supplements: Supplement[] }) {
  // Group by timing in the query's order.
  const groups = new Map<string, Supplement[]>();
  for (const s of supplements) {
    const key = (s.timing ?? 'other').toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(s);
    groups.set(key, list);
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Current Supplement Stack
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...groups.entries()].map(([timing, items]) => (
            <Box key={timing}>
              <Typography variant="overline" color="text.secondary">
                {TIMING_LABEL[timing] ?? humanize(timing)}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  mt: 0.5,
                }}
              >
                {items.map((s) => (
                  <Box
                    key={s.id}
                    sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="subtitle2">{s.supplement}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.dosage}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      {s.reason && <Chip size="small" variant="outlined" label={s.reason} />}
                      {s.efficacy && <Chip size="small" color="success" variant="outlined" label={`efficacy: ${s.efficacy}`} />}
                    </Box>
                    {s.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                        {s.notes}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function JournalPage() {
  const notes = listHealthNotes();
  const supplements = listSupplements();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4">Health Journal</Typography>
        <Typography variant="body2" color="text.secondary">
          {notes.length} notes · {supplements.length} supplements logged
        </Typography>
      </Box>

      {supplements.length > 0 && <SupplementStack supplements={supplements} />}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {notes.map((n) => (
          <Card
            key={n.id}
            id={`note-${n.id}`}
            sx={{ borderLeft: '3px solid', borderColor: CATEGORY[n.category] ?? '#888', scrollMarginTop: 80 }}
          >
            <CardContent>
              <NoteBody note={n} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
