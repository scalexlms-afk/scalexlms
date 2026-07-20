import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@scalex/ui", "@scalex/db"],
  poweredByHeader: false,
  compress: true,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  redirects: async () => [
    {
      source: "/blog/how-to-scale-lms-100k-users",
      destination: "/blog/amazon-fba-private-label-beginners-guide",
      permanent: true,
    },
    {
      source: "/blog/enterprise-lms-architecture-patterns",
      destination: "/blog/product-research-winning-amazon-products",
      permanent: true,
    },
    {
      source: "/blog/scaling-laws-digital-learning",
      destination: "/blog/amazon-fba-launch-checklist",
      permanent: true,
    },
  ],
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
