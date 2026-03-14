/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      ...(process.env.IMAGE_DOMAIN
        ? [
            {
              protocol: "https",
              hostname: process.env.IMAGE_DOMAIN,
            },
            {
              protocol: "http",
              hostname: process.env.IMAGE_DOMAIN,
            },
          ]
        : []),
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
