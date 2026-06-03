import type { Metadata } from 'next';
import Providers from './providers';
import AppShell from '@/components/AppShell';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'Health Dashboard',
  description: 'Personal Garmin health data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
