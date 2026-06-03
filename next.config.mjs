/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module — keep it external to the server bundle
  // so its compiled .node binding is required at runtime, not bundled.
  serverExternalPackages: ['better-sqlite3'],
  // Served behind `tailscale serve` on the tailnet; no image optimization needed.
  images: { unoptimized: true },
};

export default nextConfig;
