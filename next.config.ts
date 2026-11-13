import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The App Store asks for a support URL; /contact is the same page under the name people guess.
  async redirects() {
    return [{ source: "/contact", destination: "/support", permanent: true }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
