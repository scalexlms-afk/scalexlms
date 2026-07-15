import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@scalex/ui", "@scalex/db"],
  poweredByHeader: false,
  compress: true,
  headers: async () => [
    {
      source: "/llms.txt",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/blog/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      ],
    },
  ],
};

export default nextConfig;
