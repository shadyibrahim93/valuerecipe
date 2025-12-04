/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,

  sassOptions: {
    sourceMap: true,
    includePaths: [path.join(__dirname, 'scss')]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com'
      }
    ]
  },

  async rewrites() {
    // Only enable ads.txt redirect in PRODUCTION
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/ads.txt',
          destination:
            'https://srv.adstxtmanager.com/19390/valuerecipekitchen.com'
        }
      ];
    }

    // No rewrite in dev
    return [];
  }
};

// 🔥 MUST USE COMMONJS EXPORT FOR FIREBASE SSR
module.exports = nextConfig;
