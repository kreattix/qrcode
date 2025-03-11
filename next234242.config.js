/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/qrcode",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
