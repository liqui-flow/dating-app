/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // ✅ Needed for Render deployment

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
