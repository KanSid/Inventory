import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  // Supabase image domains for product images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Uploaded filenames are random hex and never overwritten (upsert: false),
    // so it's safe to cache optimized versions indefinitely. Without this,
    // Next re-fetches the same images from Supabase every ~60s, defeating
    // the point of routing images through next/image.
    minimumCacheTTL: 31536000, // 1 year
  },

  // Strict TypeScript check (default in Next.js 16)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
