import { listHealthEvents } from '@/lib/queries';
import TimelineFiltered from '@/components/TimelineFiltered';

export const dynamic = 'force-dynamic';

export default function TimelinePage() {
  return <TimelineFiltered events={listHealthEvents()} />;
}
