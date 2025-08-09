import type { NextConfig } from "next";

const config: NextConfig = {
   api: {
    bodyParser: {
      sizeLimit: '50mb', // 원하는 크기로 설정 (예: 10MB)
    },
   },
};

export default config;
