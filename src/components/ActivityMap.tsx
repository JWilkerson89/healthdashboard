'use client';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';

// Leaflet touches `window`, so the actual map renders client-only.
const Inner = dynamic(() => import('./ActivityMapInner'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 360, borderRadius: 3, bgcolor: 'action.hover' }} />
  ),
});

export default function ActivityMap({ path }: { path: [number, number][] }) {
  if (!path.length) return null;
  return <Inner path={path} />;
}
