import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import ThemeRegistry from './ThemeRegistry';
import AppShell from '@/components/AppShell';
import { DEFAULT_PRESET } from '@/lib/themes';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'Health Dashboard',
  description: 'Personal Garmin health data',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the persisted theme server-side so the first paint matches (no flash).
  const preset = (await cookies()).get('theme')?.value ?? DEFAULT_PRESET;

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeRegistry initialPreset={preset}>
          <AppShell>{children}</AppShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}
