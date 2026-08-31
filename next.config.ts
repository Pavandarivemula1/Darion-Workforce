import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    'workforce.darion.in',
    '*.darion.in',
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.ngrok.app',
    '*.loca.lt',
    '*.pinggy.link',
    '*.pinggy.net',
    '*.run.pinggy-free.link',
    '*.free.pinggy.net',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
      allowedOrigins: [
        'localhost:3000',
        'workforce.darion.in',
        '*.darion.in',
        '*.ngrok-free.app',
        '*.ngrok.io',
        '*.ngrok.app',
        '*.loca.lt',
        '*.pinggy.link',
        '*.pinggy.net',
        '*.run.pinggy-free.link',
        '*.free.pinggy.net',
      ],
    },
  },
};

export default nextConfig;
