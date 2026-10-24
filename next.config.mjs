/** @type {import('next').NextConfig} */
const nextConfig = {
  // 記事のMarkdownを実行時にも読めるようにする
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
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
