import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
    typedRoutes: true,
  },
  eslint: {
    dirs: ["src", "packages", "integrations", "tests"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
