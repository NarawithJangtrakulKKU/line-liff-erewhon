import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['prisma'],
    // Enable experimental features for better performance
    optimizeCss: true,
    optimizeServerReact: true,
  },
  // Add API configuration for large file uploads
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Increase size limit for file uploads
    },
    responseLimit: '100mb',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'profile.line-scdn.net',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production',
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'], // Add modern formats for better compression
  },
  serverExternalPackages: ['prisma'],
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  trailingSlash: false,
  compress: true, // Enable gzip compression
  poweredByHeader: false,
  // Optimize output for better performance
  output: 'standalone',
  generateEtags: true,
  // Add timeout configuration for API routes
  serverRuntimeConfig: {
    // Increase timeout for file processing
    maxDuration: 300, // 5 minutes
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, must-revalidate', // 30 days for uploads
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Accept',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
    ];
  },
  async rewrites() {
    return process.env.NODE_ENV === 'production' ? [
      {
        source: '/images/:path*',
        destination: '/api/static/images/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: '/api/static/uploads/:path*',
      },
    ] : [];
  },
  // Add optimization for webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize bundle size for client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // Add optimization for large files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media/',
          outputPath: 'static/media/',
        },
      },
    });

    return config;
  },
};

export default nextConfig;
