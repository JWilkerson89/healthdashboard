import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { listHealthNotes, listSupplements, type Supplement } from '@/lib/queries';
import Markdown from '@/components/Markdown';
import { CATEGORY } from '@/lib/colors';
import { fmtDateLong, humanize } from '@/lib/format';

export const dynamic = 'force-dynamic';

function parseArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))) : [];
  } catch {
    return [];
  }
}

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
        {notes.map((n) => {
          const actions = parseArray(n.action_items);
          const linked = parseArray(n.linked_records);
          const color = CATEGORY[n.category] ?? '#888';
          return (
            <Card key={n.id} sx={{ borderLeft: '3px solid', borderColor: color }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip size="small" label={humanize(n.category)} sx={{ bgcolor: color, color: '#000' }} />
                  {n.priority === 'high' && <Chip size="small" color="error" label="High priority" />}
                  <Typography variant="caption" color="text.secondary">
                    {fmtDateLong(n.entry_date)}
                  </Typography>
                  {n.source && n.source !== 'manual' && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      via {n.source}
                    </Typography>
                  )}
                </Box>

                <Markdown>{n.content}</Markdown>

                {actions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="overline" color="text.secondary">
                      Action items
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                      {actions.map((a, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 16, mt: 0.3, color: 'text.secondary' }} />
                          <Typography variant="body2">{a}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {linked.length > 0 && (
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Linked:
                    </Typography>
                    {linked.map((l, i) => (
                      <Chip key={i} size="small" variant="outlined" label={l} />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
