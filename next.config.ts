import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              'upgrade-insecure-requests',
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: data: blob: ws: wss:",
              "connect-src 'self' ws: wss: http: https:",
              "media-src 'self' http: https: data: blob:",
              "child-src 'self' blob:",
              "worker-src 'self' blob:",
              "frame-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
