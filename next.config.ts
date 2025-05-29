import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
    responseLimit: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['prisma'],
  },
};

export default nextConfig;
