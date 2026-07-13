import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 클릭재킹 방지: 다른 사이트의 iframe에서 우리 페이지를 불러오지 못하게 차단
          { key: 'X-Frame-Options', value: 'DENY' },
          // MIME 타입 스니핑 방지: 브라우저가 Content-Type을 임의 추론하지 못하게 차단
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer 정보 제한: HTTPS→HTTP 이동 시 경로(URL) 정보 유출 방지
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HTTPS 강제: 브라우저가 항상 HTTPS로만 접속하도록 지시 (2년 캐시)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // XSS 보호 필터 활성화 (레거시 브라우저 대응)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // 브라우저 기능 제한: 카메라, 마이크, 위치정보 등 불필요한 API 차단
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
