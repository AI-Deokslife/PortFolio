import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   api: {
    bodyParser: {
      sizeLimit: '50mb', // 원하는 크기로 설정 (예: 10MB)
    },
   },
};

export default nextConfig;
