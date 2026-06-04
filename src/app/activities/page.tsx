import { listActivities, noteIndex, type NoteSummary } from '@/lib/queries';
import ActivitiesList from '@/components/ActivitiesList';
import { toLocal } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function ActivitiesPage() {
  const activities = listActivities();
  const idx = noteIndex();
  const noteSummaries: Record<number, NoteSummary | undefined> = {};
  for (const a of activities) {
    const d = toLocal(a.start_ts, a.timezone_offset_hours).toISOString().slice(0, 10);
    noteSummaries[a.activity_id] = idx.summaryFor('activity', d);
  }
  return <ActivitiesList activities={activities} noteSummaries={noteSummaries} />;
}
