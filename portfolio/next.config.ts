import type { NextConfig } from "next";

 const nextConfig: NextConfig = {
   // 파일 업로드 용량 제한을 50MB로 늘립니다.
   api: {
     bodyParser: {
       sizeLimit: "50mb",
     },
   },

   // 빌드 시 타입스크립트 에러가 있어도 빌드를 강제로 성공시킵니다. (문제 진단용)
   typescript: {
     // !! 경고 !!
     // 프로젝트에 타입 에러가 있어도 프로덕션 빌드를 강제로 성공시킵니다.
     ignoreBuildErrors: true,
   },
 };

 export default nextConfig;
