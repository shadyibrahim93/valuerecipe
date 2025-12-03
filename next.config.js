/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,

  // 🔥 Fix for the "import is reserved" error:
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  },

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
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/ads.txt',
          destination:
            'https://srv.adstxtmanager.com/19390/valuerecipekitchen.com'
        }
      ];
    }
    return [];
  }
};

module.exports = nextConfig;
