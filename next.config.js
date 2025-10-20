/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for this standalone app
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow TypeScript errors during builds (warnings only)
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
