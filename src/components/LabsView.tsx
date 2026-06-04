'use client';
import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Stack, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import NoteDot from '@/components/NoteDot';
import LinkedNotes from '@/components/LinkedNotes';
import { fmtDateLong, fmtNum } from '@/lib/format';
import type { BloodPanelRow, HealthNote, NoteSummary } from '@/lib/queries';

export interface LabPanel {
  date: string;
  rows: BloodPanelRow[];
  notes: HealthNote[];
  summary?: NoteSummary;
}

function flagColor(flag: string | null): 'error' | 'warning' | 'default' {
  if (!flag) return 'default';
  const f = flag.toUpperCase();
  if (f.includes('HIGH')) return 'error';
  if (f.includes('LOW')) return 'warning';
  return 'default';
}

export default function LabsView({ panels }: { panels: LabPanel[] }) {
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const view = panels
    .map((p) => ({ ...p, rows: flaggedOnly ? p.rows.filter((r) => r.flags) : p.rows }))
    .filter((p) => p.rows.length > 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4">Labs</Typography>
        <FormControlLabel
          sx={{ ml: 'auto' }}
          control={<Switch size="small" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} />}
          label={<Typography variant="body2">Flagged only</Typography>}
        />
      </Stack>

      {view.length === 0 && (
        <Typography color="text.secondary">
          {panels.length === 0 ? 'No blood panels recorded.' : 'No flagged results.'}
        </Typography>
      )}

      {view.map((panel) => {
        const flagged = panel.rows.filter((p) => p.flags).length;
        return (
          <Card key={panel.date}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h6">{fmtDateLong(panel.date)}</Typography>
                <Chip size="small" label={`${panel.rows.length} tests`} variant="outlined" />
                {flagged > 0 && <Chip size="small" color="warning" label={`${flagged} flagged`} />}
                <NoteDot summary={panel.summary} />
              </Box>
              {panel.notes.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <LinkedNotes notes={panel.notes} />
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
                  {panel.rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.test_name}</TableCell>
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
                        {p.flags ? <Chip size="small" color={flagColor(p.flags)} label={p.flags} /> : ''}
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
