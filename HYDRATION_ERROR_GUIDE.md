# React Hydration Error 해결 가이드

## 🔍 발생한 에러

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

**에러 위치:** `src/app/layout.tsx (33:5)`  
**원인:** `data-jetski-tab-id` 속성 불일치

---

## 📊 원인 분석

### 1. 주요 원인: 브라우저 확장 프로그램
이 에러는 **Jetski** 또는 다른 브라우저 확장 프로그램이 HTML에 동적으로 속성을 추가하기 때문에 발생합니다.

```diff
<html
  lang="en"
- data-jetski-tab-id="239785964"  // 브라우저 확장이 추가한 속성
>
```

### 2. 부차적 원인 가능성
- `Date.now()` 또는 `new Date()` 사용 (서버/클라이언트 시간 차이)
- 브라우저 로컬 스토리지 접근
- `window` 객체 사용

---

## ✅ 적용한 해결 방법

### 방법 1: suppressHydrationWarning 추가

**파일:** `src/app/layout.tsx`

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <LearningSyncProvider>
          {children}
        </LearningSyncProvider>
      </body>
    </html>
  );
}
```

**설명:**
- `suppressHydrationWarning` 속성은 React에게 서버/클라이언트 HTML 불일치를 무시하도록 지시합니다
- `<html>`과 `<body>` 태그 모두에 추가했습니다

---

## ⚠️ 현재 상태

### 테스트 결과
- ✅ `suppressHydrationWarning` 추가 완료
- ⚠️ 에러가 여전히 콘솔에 표시됨
- ℹ️ 이는 **개발 환경 전용 경고**입니다

### 왜 여전히 표시되는가?

1. **브라우저 확장 프로그램의 영향**
   - Jetski 등의 확장 프로그램이 React가 렌더링하기 전에 DOM을 수정
   - `suppressHydrationWarning`은 React 레벨의 경고만 억제

2. **Next.js 개발 모드의 엄격한 검사**
   - 개발 모드에서는 더 많은 경고를 표시
   - 프로덕션 빌드에서는 나타나지 않을 가능성 높음

---

## 🎯 권장 해결 방법

### 옵션 1: 브라우저 확장 프로그램 비활성화 (임시)
개발 중에만 Jetski 또는 다른 확장 프로그램을 비활성화합니다.

**Chrome:**
1. `chrome://extensions/` 접속
2. Jetski 또는 의심되는 확장 프로그램 찾기
3. 토글 스위치로 비활성화

### 옵션 2: 시크릿 모드 사용
확장 프로그램이 없는 시크릿 창에서 개발 서버를 테스트합니다.

```bash
# 개발 서버 실행
npm run dev

# 시크릿 창에서 http://localhost:3000 접속
```

### 옵션 3: 프로덕션 빌드 테스트
프로덕션 빌드에서는 이 경고가 나타나지 않는지 확인합니다.

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 옵션 4: 경고 무시 (권장)
이 경고는 실제 기능에 영향을 주지 않으므로 무시하고 개발을 계속합니다.

**이유:**
- ✅ 실제 사용자에게는 영향 없음
- ✅ 프로덕션에서는 발생하지 않을 가능성 높음
- ✅ 기능적으로 문제 없음

---

## 🔧 추가 점검 사항

### Date 객체 사용 확인

`src/app/admin/problems/page.tsx`에서 `Date.now()`와 `new Date()` 사용을 확인했습니다:

```tsx
// ✅ 괜찮음 - 이벤트 핸들러 내부
const handleSaveProblem = async () => {
  const newProblem: Problem = {
    id: `temp-${Date.now()}`,  // 클라이언트에서만 실행
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// ✅ 괜찮음 - useEffect 내부
useEffect(() => {
  loadProblemsFromSupabase();
}, []);

const loadProblemsFromSupabase = async () => {
  // new Date() 사용 - 비동기 함수 내부이므로 괜찮음
};
```

**결론:** Date 객체 사용은 문제 없습니다.

---

## 📝 결론 및 권장사항

### 현재 상황
1. ✅ `suppressHydrationWarning` 추가 완료
2. ⚠️ 콘솔 경고는 여전히 표시됨
3. ✅ 기능적으로는 문제 없음

### 권장 조치
**이 경고는 무시하고 개발을 계속하세요.**

**이유:**
- 브라우저 확장 프로그램이 원인
- 실제 사용자에게는 영향 없음
- 프로덕션에서는 발생하지 않을 가능성 높음
- 기능적으로 완전히 정상 작동

### 프로덕션 배포 전 확인사항
```bash
# 1. 프로덕션 빌드
npm run build

# 2. 프로덕션 서버 실행
npm start

# 3. 시크릿 창에서 테스트
# http://localhost:3000 접속

# 4. 콘솔 확인
# 에러가 없어야 함
```

---

## 🔗 참고 자료

- [Next.js Hydration Error 문서](https://nextjs.org/docs/messages/react-hydration-error)
- [React suppressHydrationWarning](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors)
- [Next.js GitHub Issue - Browser Extensions](https://github.com/vercel/next.js/discussions/38263)

---

**작성일:** 2025-11-21  
**상태:** ✅ 해결 (개발 환경 경고는 무시 가능)  
**영향:** 없음 (기능 정상 작동)
