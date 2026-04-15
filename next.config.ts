import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Allow external image domains for competitor ads
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },

  // Suppress hydration warnings for RTL content
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
