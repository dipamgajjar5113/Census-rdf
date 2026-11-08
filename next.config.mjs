/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let production verification run without replacing a live dev server's cache.
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  transpilePackages: ["three"],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
