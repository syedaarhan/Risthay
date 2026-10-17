/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ['192.168.0.113', 'localhost', '127.0.0.1'],
};

export default nextConfig;
