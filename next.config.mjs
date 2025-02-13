/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns:[
      {
        hostname: "crm-core-attachments.s3.us-east-2.amazonaws.com",
      }
    ]
  }
};

export default nextConfig;
