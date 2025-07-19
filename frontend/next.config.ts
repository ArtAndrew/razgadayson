import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimization
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['razgazdayson.ru', 'api.razgazdayson.ru'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/sonnik/:path*',
        destination: '/catalog/:path*',
        permanent: true,
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://razgazdayson.ru',
  },

  // Disable powered by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // React strict mode
  reactStrictMode: true,

  // SWC minification
  swcMinify: true,
};

export default nextConfig;
