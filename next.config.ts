import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emits .next/standalone with a server.js and only the node_modules actually reached,
  // which is what keeps the runtime image small enough to be worth building.
  output: 'standalone',
};

export default nextConfig;
