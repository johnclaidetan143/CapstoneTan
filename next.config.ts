import type { NextConfig } from "next";

const isAdminPort = process.env.PORT === "3001";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    if (!isAdminPort) return [];
    return [
      {
        source: "/",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
