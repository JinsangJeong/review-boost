import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 외부 이미지 도메인 ( 필요시 추가 )
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.coupangcdn.com" },
      { protocol: "https", hostname: "**.amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
    ],
  },
};

export default nextConfig;
