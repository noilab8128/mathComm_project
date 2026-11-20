import type { NextConfig } from "next";

// Content Security Policy (보안 항목 C7). 먼저 Report-Only로 둡니다: 막지 않고, 어긋나는 요청을 브라우저 콘솔에
// "[Report Only]"로만 알려 줍니다. 몇 주 동안 콘솔에 경고가 없으면 키 이름을 Content-Security-Policy로 바꿔 실제로 적용합니다.
// 허용한 곳: Supabase(데이터·이미지), Cloudflare Turnstile(로그인 보안 확인), jsDelivr(MathJax 수식), unpkg(관리자 PDF
// 변환 worker), Google·Facebook(프로필 사진, 소셜 로그인). 글꼴은 next/font가 자체 호스팅합니다.
// 'unsafe-inline'은 Next.js가 페이지에 넣는 인라인 스크립트 때문에 필요합니다(nonce 방식은 이후 과제).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://challenges.cloudflare.com https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://platform-lookaside.fbsbx.com https://*.supabase.co",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://cdn.jsdelivr.net",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob: https://unpkg.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com https://www.facebook.com https://facebook.com",
  "frame-ancestors 'none'",
].join("; ");

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
          // 예전 브라우저의 XSS 필터는 오히려 악용될 수 있어 끕니다(최신 권고). XSS 방어는 아래 CSP가 맡습니다.
          { key: 'X-XSS-Protection', value: '0' },
          // 콘텐츠 보안 정책(CSP): 위 설명대로 지금은 보고만 함
          { key: 'Content-Security-Policy-Report-Only', value: CSP },
          // 브라우저 기능 제한: 카메라, 마이크, 위치정보 등 불필요한 API 차단
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
