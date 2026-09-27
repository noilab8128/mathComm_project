/**
 * 인메모리 기반 IP Rate Limiter
 * 로그인, 회원가입 등 민감한 API에 적용하여 Brute Force 공격을 방지합니다.
 * 
 * 동작 방식:
 * - 각 IP별로 windowMs 시간 동안 maxRequests 횟수까지만 요청을 허용합니다.
 * - 초과 시 { success: false }를 반환하여 API에서 429 응답을 내보낼 수 있습니다.
 * - 메모리 누수 방지를 위해 만료된 레코드를 주기적으로 자동 정리합니다.
 * 
 * 주의: 서버리스 환경(Vercel 등)에서는 인스턴스 간 메모리가 공유되지 않으므로,
 * 트래픽이 많아지면 Redis 기반(upstash/ratelimit 등)으로 업그레이드를 권장합니다.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRecords = new Map<string, RateLimitRecord>();

// 만료 레코드 자동 정리 (5분마다)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRecords.entries()) {
    if (now > record.resetTime) {
      ipRecords.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit({
  windowMs = 15 * 60 * 1000, // 기본 15분
  maxRequests = 10,           // 기본 10회
} = {}) {
  return {
    check(ip: string): { success: boolean; remaining: number; resetTime: number } {
      const now = Date.now();
      const record = ipRecords.get(ip);

      // 레코드가 없거나 만료 → 새로 시작
      if (!record || now > record.resetTime) {
        ipRecords.set(ip, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: maxRequests - 1, resetTime: now + windowMs };
      }

      // 아직 윈도우 내 → 카운트 증가
      record.count += 1;

      if (record.count > maxRequests) {
        return { success: false, remaining: 0, resetTime: record.resetTime };
      }

      return { success: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
    },
  };
}

// 로그인/회원가입용: 15분 내 10회까지 허용
export const authRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 });

// 게시글 작성용: 1분 내 5회까지 허용
export const postRateLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 5 });
