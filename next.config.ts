import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
