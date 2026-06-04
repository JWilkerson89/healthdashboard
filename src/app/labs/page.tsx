import { listBloodPanels, noteIndex, type BloodPanelRow } from '@/lib/queries';
import LabsView, { type LabPanel } from '@/components/LabsView';

export const dynamic = 'force-dynamic';

export default function LabsPage() {
  const rows = listBloodPanels();
  const notes = noteIndex();

  // Group by date (rows already ordered date DESC, test ASC).
  const byDate = new Map<string, BloodPanelRow[]>();
  for (const r of rows) {
    const list = byDate.get(r.date) ?? [];
    list.push(r);
    byDate.set(r.date, list);
  }

  const panels: LabPanel[] = [...byDate.entries()].map(([date, panelRows]) => ({
    date,
    rows: panelRows,
    notes: notes.notesFor('blood_panel', date),
    summary: notes.summaryFor('blood_panel', date),
  }));

  return <LabsView panels={panels} />;
}
