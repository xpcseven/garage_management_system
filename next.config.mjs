/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // لا تستخدم /_next/image — مسارات مباشرة من public و uploads
  images: {
    loader: "custom",
    loaderFile: "./lib/passthrough-image-loader.ts",
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tr.ashuor.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "tr.ashuor.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      // HTML: لا تخزّن طويلاً حتى لا يبقى مرجعاً لـ chunks قديمة بعد النشر
      {
        source: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
