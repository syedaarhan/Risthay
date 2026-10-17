/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ['192.168.0.113', 'localhost', '127.0.0.1'],
  async rewrites() {
    return [
      {
        source: '/syedristhay',
        destination: '/admin',
      },
      {
        source: '/syedristhay/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
