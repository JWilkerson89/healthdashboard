import { Box, Typography, Chip, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Markdown from '@/components/Markdown';
import { CATEGORY } from '@/lib/colors';
import { fmtDateLong, humanize } from '@/lib/format';
import type { HealthNote } from '@/lib/queries';

export function parseArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v)
      ? v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
      : [];
  } catch {
    return [];
  }
}

/** Full rendering of one journal note: header chips, markdown, action items. */
export default function NoteBody({
  note,
  showLinked = true,
}: {
  note: HealthNote;
  showLinked?: boolean;
}) {
  const actions = parseArray(note.action_items);
  const linked = showLinked ? parseArray(note.linked_records) : [];
  const color = CATEGORY[note.category] ?? '#888';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip size="small" label={humanize(note.category)} sx={{ bgcolor: color, color: '#000' }} />
        {note.priority === 'high' && <Chip size="small" color="error" label="High priority" />}
        <Typography variant="caption" color="text.secondary">
          {fmtDateLong(note.entry_date)}
        </Typography>
        {note.source && note.source !== 'manual' && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            via {note.source}
          </Typography>
        )}
      </Box>

      <Markdown>{note.content}</Markdown>

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
    </Box>
  );
}
