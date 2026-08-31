/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cf.geekdo-images.com" }],
  },
};

export default nextConfig;
