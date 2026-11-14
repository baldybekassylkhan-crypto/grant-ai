import type { NextConfig } from "next";

const STATIC = process.env.NEXT_PUBLIC_STATIC === "1";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Static build (GitHub Pages): plain HTML files, no server, no redirects. */
const staticConfig: NextConfig = {
  output: "export",
  basePath: BASE,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

const nextConfig: NextConfig = STATIC ? staticConfig : {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/", destination: "/kk", permanent: false },
      { source: "/en", destination: "/kk", permanent: false },
      { source: "/en/:path*", destination: "/kk/:path*", permanent: false },
      { source: "/:l(kk|ru)/games/durys-pa", destination: "/:l/games/bazar", permanent: true },
    ];
  },
};

export default nextConfig;
