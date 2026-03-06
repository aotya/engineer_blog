/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: process.env.IMAGE_DOMAIN ? [process.env.IMAGE_DOMAIN] : [],
  },
};

export default nextConfig;
