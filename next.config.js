/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  sassOptions: {
    sourceMap: true,
    includePaths: [path.join(__dirname, 'scss')]
  },

  images: {
    // Cloudflare does not support the default Next.js Image Optimization API.
    // We set unoptimized: true to serve images as-is (saving bandwidth & processing).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hhdwpdvczefdyuynppjk.supabase.co'
      }
    ]
  },

  async rewrites() {
    // Only enable ads.txt redirect in PRODUCTION
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/ads.txt',
          destination: 'https://srv.adstxtmanager.com/19390/rekadish.com'
        }
      ];
    }

    // No rewrite in dev
    return [];
  }
};

// 🔥 MUST USE COMMONJS EXPORT FOR FIREBASE SSR (AND OPENNEXT)
module.exports = nextConfig;
