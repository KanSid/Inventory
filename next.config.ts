import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Supabase image domains for product images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Strict TypeScript check (default in Next.js 16)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
