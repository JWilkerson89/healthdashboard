import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  listBloodPanels,
  noteSummaryByRecord,
  notesForRecords,
  type BloodPanelRow,
} from '@/lib/queries';
import NoteDot from '@/components/NoteDot';
import LinkedNotes from '@/components/LinkedNotes';
import { fmtDateLong, fmtNum } from '@/lib/format';

export const dynamic = 'force-dynamic';

function flagColor(flag: string | null): 'error' | 'warning' | 'default' {
  if (!flag) return 'default';
  const f = flag.toUpperCase();
  if (f.includes('HIGH')) return 'error';
  if (f.includes('LOW')) return 'warning';
  return 'default';
}

export default function LabsPage() {
  const rows = listBloodPanels();
  const noteMap = noteSummaryByRecord('blood_panel');

  // Group by date (descending), preserving the query's test ordering within.
  const byDate = new Map<string, BloodPanelRow[]>();
  for (const r of rows) {
    const list = byDate.get(r.date) ?? [];
    list.push(r);
    byDate.set(r.date, list);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">Labs</Typography>
      {byDate.size === 0 && (
        <Typography color="text.secondary">No blood panels recorded.</Typography>
      )}
      {[...byDate.entries()].map(([date, panel]) => {
        const flagged = panel.filter((p) => p.flags).length;
        const linkedIds = panel.filter((p) => noteMap.has(p.id)).map((p) => p.id);
        const panelNotes = linkedIds.length ? notesForRecords('blood_panel', linkedIds) : [];
        return (
          <Card key={date}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h6">{fmtDateLong(date)}</Typography>
                <Chip
                  size="small"
                  label={`${panel.length} tests`}
                  variant="outlined"
                />
                {flagged > 0 && (
                  <Chip size="small" color="warning" label={`${flagged} flagged`} />
                )}
              </Box>
              {panelNotes.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <LinkedNotes notes={panelNotes} />
                </Box>
              )}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Reference</TableCell>
                    <TableCell>Flag</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {panel.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {p.test_name}
                          <NoteDot summary={noteMap.get(p.id)} />
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: p.flags ? 700 : 400 }}>
                        {fmtNum(p.value, p.value != null && p.value % 1 !== 0 ? 2 : 0)}
                      </TableCell>
                      <TableCell>{p.unit ?? ''}</TableCell>
                      <TableCell align="right">
                        {p.ref_low != null || p.ref_high != null
                          ? `${p.ref_low ?? ''}–${p.ref_high ?? ''}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {p.flags ? (
                          <Chip size="small" color={flagColor(p.flags)} label={p.flags} />
                        ) : (
                          ''
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
