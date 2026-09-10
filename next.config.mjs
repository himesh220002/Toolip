/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendHost = process.env.NEXT_PUBLIC_API_URL || 'https://toolip-r2ve.onrender.com';
    return [
      {
        source: '/api/auth/:path*',
        destination: `${backendHost}/api/auth/:path*`,
      },
      {
        source: '/api/rooms/:path*',
        destination: `${backendHost}/api/rooms/:path*`,
      },
      {
        source: '/api/nvidia/:path*',
        destination: `${backendHost}/api/nvidia/:path*`,
      },
    ];
  },
};

export default nextConfig;
