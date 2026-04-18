/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ativa a geração da pasta .next/standalone no momento do build
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "crm-core-attachments.s3.us-east-2.amazonaws.com",
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
