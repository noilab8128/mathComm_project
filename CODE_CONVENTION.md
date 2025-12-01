# MathComm Code Convention

## 📋 목차
1. [프로젝트 구조](#프로젝트-구조)
2. [네이밍 규칙](#네이밍-규칙)
3. [컴포넌트 작성 규칙](#컴포넌트-작성-규칙)
4. [스타일링 규칙](#스타일링-규칙)
5. [상태 관리](#상태-관리)
6. [API 및 데이터베이스](#api-및-데이터베이스)
7. [Git 워크플로우](#git-워크플로우)
8. [작업 분담](#작업-분담)

---

## 프로젝트 구조

```
mathComm_project/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── admin/               # 관리자 페이지 (담당: 개발자 A)
│   │   │   └── problems/        # 문제 관리 페이지
│   │   │       ├── page.tsx     # 메인 페이지 (최대 300줄)
│   │   │       ├── components/  # 페이지별 컴포넌트
│   │   │       └── hooks/       # 페이지별 커스텀 훅
│   │   ├── (user)/              # 사용자 페이지 (담당: 개발자 B)
│   │   │   ├── dashboard/       # 대시보드
│   │   │   ├── problems/        # 문제 풀이
│   │   │   └── leaderboard/     # 리더보드
│   │   ├── api/                 # API Routes (공동 작업)
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── globals.css          # 글로벌 스타일
│   ├── components/              # 공통 컴포넌트
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── MathPreview.tsx      # KaTeX 미리보기
│   │   └── ...
│   └── lib/                     # 유틸리티 및 설정
│       ├── supabase.ts          # Supabase 클라이언트 (공동)
│       ├── categories.ts        # 카테고리 관리
│       └── utils.ts             # 공통 유틸리티
├── public/                      # 정적 파일
├── PRD.md                       # 제품 요구사항 문서
├── style_guide.md               # 스타일 가이드
├── DATABASE_SCHEMA.md           # DB 스키마
└── CODE_CONVENTION.md           # 이 문서
```

### 파일 크기 제한
- **페이지 컴포넌트**: 최대 300줄
- **일반 컴포넌트**: 최대 200줄
- **커스텀 훅**: 최대 150줄
- 초과 시 반드시 분리할 것

---

## 네이밍 규칙

### 파일 및 폴더
```
✅ 좋은 예:
- ProblemList.tsx          (컴포넌트: PascalCase)
- useProblemManagement.ts  (훅: camelCase with 'use' prefix)
- problem-card.module.css  (CSS: kebab-case)
- api/problems/route.ts    (API: kebab-case)

❌ 나쁜 예:
- problemList.tsx
- Problem_List.tsx
- use_problem_management.ts
```

### 변수 및 함수
```typescript
// 변수: camelCase
const problemList = [];
const isLoading = false;
const userProfile = {};

// 상수: UPPER_SNAKE_CASE
const MAX_DIFFICULTY = 10;
const API_BASE_URL = "https://...";

// 함수: camelCase (동사로 시작)
function fetchProblems() {}
function handleSubmit() {}
function calculateDifficulty() {}

// 컴포넌트: PascalCase
function ProblemCard() {}
function MathPreview() {}

// 타입/인터페이스: PascalCase
interface Problem {}
type DifficultyLevel = 1 | 2 | 3;
```

### 이벤트 핸들러
```typescript
// 패턴: handle + 동작 + 대상
const handleClickSubmit = () => {};
const handleChangeDifficulty = () => {};
const handleDeleteProblem = () => {};

// 컴포넌트 props
interface ButtonProps {
  onClick?: () => void;      // 외부에서 받는 핸들러
  onSubmit?: () => void;
}

// 내부 핸들러
function MyComponent({ onClick }: ButtonProps) {
  const handleClick = () => {  // 내부 로직 처리
    // ... 추가 로직
    onClick?.();               // 외부 핸들러 호출
  };
}
```

---

## 컴포넌트 작성 규칙

### 컴포넌트 구조
```typescript
"use client"; // 필요한 경우에만

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProblemManagement } from "./hooks/useProblemManagement";

// 1. 타입 정의
interface ProblemCardProps {
  problem: Problem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// 2. 컴포넌트 정의
export default function ProblemCard({ 
  problem, 
  onEdit, 
  onDelete 
}: ProblemCardProps) {
  // 3. 훅 (순서: useState → useEffect → 커스텀 훅)
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteProblem } = useProblemManagement();
  
  useEffect(() => {
    // 부수 효과
  }, []);
  
  // 4. 이벤트 핸들러
  const handleEdit = () => {
    onEdit?.(problem.id);
  };
  
  const handleDelete = async () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteProblem(problem.id);
      onDelete?.(problem.id);
    }
  };
  
  // 5. 렌더링 로직
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800">
        {problem.title}
      </h3>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleEdit} variant="outline" size="sm">
          Edit
        </Button>
        <Button onClick={handleDelete} variant="outline" size="sm">
          Delete
        </Button>
      </div>
    </div>
  );
}
```

### 컴포넌트 분리 기준
```typescript
// ❌ 나쁜 예: 모든 것을 한 파일에
function ProblemsPage() {
  // 500줄의 코드...
  return (
    <div>
      {/* 복잡한 JSX */}
    </div>
  );
}

// ✅ 좋은 예: 관심사 분리
function ProblemsPage() {
  const { problems, loading } = useProblems();
  
  return (
    <div>
      <ProblemHeader />
      <ProblemFilters />
      <ProblemList problems={problems} loading={loading} />
    </div>
  );
}
```

---

## 스타일링 규칙

### Tailwind CSS 클래스 순서
**반드시 `style_guide.md`의 순서를 따를 것:**

```typescript
// 순서: 레이아웃 > 크기 > 플렉스/그리드 > 간격 > 배경 > 경계선 > 텍스트/폰트 > 상호작용
className="
  w-full h-full          // 1. 레이아웃
  flex flex-col          // 2. 플렉스/그리드
  items-center           // 3. 정렬
  justify-start
  p-6 space-y-4          // 4. 간격
  bg-white               // 5. 배경
  rounded-lg             // 6. 모서리
  border border-gray-200 // 7. 경계선
  text-gray-800          // 8. 텍스트
  font-semibold
  hover:bg-gray-50       // 9. 상호작용
  transition-all
"
```

### 색상 사용 규칙
**`style_guide.md`에 정의된 색상만 사용:**

```typescript
// ✅ 허용된 색상
bg-white              // 배경
bg-gray-100           // Hover
text-gray-800         // 제목/강조
text-gray-500         // 보조 텍스트
text-blue-600         // Primary Accent
border-gray-200       // 구분선
border-blue-600       // 활성 상태

// ❌ 금지된 색상 (스타일 가이드에 없음)
bg-gradient-to-br from-blue-50 to-blue-100  // 그라데이션 금지
bg-red-500            // 빨강 (에러 메시지 제외)
bg-green-500          // 초록 (성공 메시지 제외)
bg-indigo-600         // 인디고 (스타일 가이드에 없음)
```

### 컴포넌트 스타일 표준
```typescript
// 카드 컴포넌트
<Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">

// 버튼 (Primary)
<Button className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">

// 입력 필드
<Input className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />

// 사이드바 메뉴 (활성)
<div className="bg-gray-100 text-gray-800 font-semibold p-3 rounded-lg">

// 사이드바 메뉴 (비활성)
<div className="text-gray-500 hover:bg-gray-50 p-3 rounded-lg">
```

### 반응형 디자인
```typescript
// 모바일 우선 (Mobile First)
<div className="
  grid grid-cols-1        // 기본: 1열
  md:grid-cols-2          // 태블릿: 2열
  lg:grid-cols-4          // 데스크톱: 4열
  gap-4 md:gap-6          // 간격도 반응형
">
```

---

## 상태 관리

### 로컬 상태 (useState)
```typescript
// 단일 컴포넌트 내부 상태
const [isOpen, setIsOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
```

### 서버 상태 (Supabase)
```typescript
// ✅ 좋은 예: 커스텀 훅으로 분리
function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProblems() {
      try {
        setLoading(true);
        const data = await problemsAPI.getAll();
        setProblems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);
  
  return { problems, loading, error };
}

// 사용
function ProblemsPage() {
  const { problems, loading, error } = useProblems();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return <ProblemList problems={problems} />;
}
```

### 폼 상태
```typescript
// 복잡한 폼은 객체로 관리
interface ProblemFormData {
  title: string;
  content: string;
  difficulty: number;
  category: string;
}

const [formData, setFormData] = useState<ProblemFormData>({
  title: "",
  content: "",
  difficulty: 5,
  category: "",
});

// 업데이트
const handleChange = (field: keyof ProblemFormData, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

---

## API 및 데이터베이스

### Supabase API 호출
```typescript
// ✅ 좋은 예: 에러 핸들링 포함
async function createProblem(data: ProblemFormData) {
  try {
    const problem = await problemsAPI.create(data);
    showToast("✅ Problem created successfully!", "success");
    return problem;
  } catch (error) {
    console.error("Failed to create problem:", error);
    showToast(`❌ Failed to create problem: ${error.message}`, "error");
    throw error;
  }
}

// ❌ 나쁜 예: 에러 무시
async function createProblem(data: ProblemFormData) {
  const problem = await problemsAPI.create(data);
  return problem;
}
```

### 데이터 변환
```typescript
// Supabase 데이터 → 로컬 형식
function convertSupabaseProblem(sp: SupabaseProblem): Problem {
  return {
    id: sp.id,
    title: sp.title,
    content: sp.content,
    solution: sp.solution || "",
    difficulty: sp.difficulty,
    category: sp.category_path || "",
    createdAt: new Date(sp.created_at),
    updatedAt: new Date(sp.updated_at),
  };
}

// 로컬 형식 → Supabase 데이터
function convertToSupabaseProblem(problem: Problem) {
  return {
    title: problem.title,
    content: problem.content,
    solution: problem.solution || undefined,
    difficulty: problem.difficulty,
    category_path: problem.category,
    // ... 나머지 필드
  };
}
```

### 데이터베이스 스키마 변경
```typescript
// ⚠️ 중요: DB 스키마 변경 시 반드시 따를 것

// 1. DATABASE_SCHEMA.md 업데이트
// 2. Supabase에서 마이그레이션 실행
// 3. src/lib/supabase.ts의 타입 업데이트
// 4. 팀원에게 알림 (Slack/Discord)
// 5. PR에 [DB CHANGE] 태그 추가
```

---

## Git 워크플로우

### 브랜치 전략
```bash
main                    # 프로덕션 (배포 가능한 상태)
├── develop            # 개발 메인 브랜치
│   ├── feature/admin-problem-list      # 개발자 A (관리자)
│   ├── feature/user-dashboard          # 개발자 B (사용자)
│   └── feature/ai-problem-generation   # 공동 작업
└── hotfix/...         # 긴급 수정
```

### 브랜치 네이밍
```bash
# 기능 개발
feature/admin-problem-editor
feature/user-problem-solving
feature/leaderboard-ranking

# 버그 수정
bugfix/problem-save-error
bugfix/katex-rendering

# 핫픽스
hotfix/database-connection

# 리팩토링
refactor/split-problem-page
refactor/improve-performance
```

### 커밋 메시지
```bash
# 형식: <type>(<scope>): <subject>

# Types:
feat:     # 새 기능
fix:      # 버그 수정
refactor: # 리팩토링
style:    # 스타일 변경 (코드 동작 변경 없음)
docs:     # 문서 변경
test:     # 테스트 추가/수정
chore:    # 빌드, 설정 변경

# 예시:
feat(admin): add problem bulk upload feature
fix(user): resolve KaTeX rendering issue
refactor(admin): split problem page into components
style(admin): apply style guide to statistics cards
docs: update CODE_CONVENTION.md
chore: update dependencies

# ⚠️ DB 변경 시 반드시 표시
feat(db): add problem_relationships table [DB CHANGE]
```

### Pull Request
```markdown
## PR 제목
feat(admin): Add problem filtering and sorting

## 변경 사항
- [ ] 문제 필터링 기능 추가 (카테고리, 난이도)
- [ ] 정렬 기능 추가 (최신순, 제목순, 난이도순)
- [ ] 스타일 가이드 적용

## 스크린샷
(스크린샷 첨부)

## 체크리스트
- [ ] 스타일 가이드 준수 확인
- [ ] TypeScript 에러 없음
- [ ] 로컬 테스트 완료
- [ ] DATABASE_SCHEMA.md 업데이트 (DB 변경 시)

## 관련 이슈
Closes #123
```

---

## 작업 분담

### 개발자 A (관리자 페이지)
**담당 영역:**
```
src/app/admin/
├── problems/          # 문제 관리
│   ├── page.tsx
│   ├── components/
│   └── hooks/
├── users/             # 사용자 관리 (추후)
└── analytics/         # 통계 (추후)
```

**주요 작업:**
- ✅ 문제 CRUD (생성, 읽기, 수정, 삭제)
- ✅ AI 문제 분석 및 생성
- ✅ Learning Path 시각화
- ✅ 문제 링크 관리
- 🔄 대량 업로드 (CSV/JSON)
- 🔄 문제 검토 워크플로우

### 개발자 B (사용자 페이지)
**담당 영역:**
```
src/app/(user)/
├── dashboard/         # 대시보드
├── problems/          # 문제 풀이
├── leaderboard/       # 리더보드
├── profile/           # 프로필
└── community/         # 커뮤니티
```

**주요 작업:**
- 🔄 대시보드 (진행 상황, 통계)
- 🔄 문제 풀이 인터페이스
- 🔄 KaTeX 렌더링 및 입력
- 🔄 제출 및 채점
- 🔄 리더보드
- 🔄 프로필 관리

### 공동 작업
**공유 영역:**
```
src/
├── components/        # 공통 컴포넌트
├── lib/              # 유틸리티
│   ├── supabase.ts   # DB API
│   ├── categories.ts # 카테고리
│   └── utils.ts      # 공통 함수
└── app/api/          # API Routes
```

**협업 규칙:**
1. **공통 파일 수정 시 반드시 상의**
   - `src/lib/supabase.ts`
   - `DATABASE_SCHEMA.md`
   - `style_guide.md`

2. **컴포넌트 공유**
   - `src/components/`에 추가
   - 재사용 가능하게 작성
   - Props 타입 명확히 정의

3. **API 변경 시 알림**
   - `/api/` 라우트 추가/수정
   - 팀원에게 즉시 알림

---

## 코드 리뷰 체크리스트

### 제출 전 자가 점검
```
[ ] 스타일 가이드 준수 (색상, 간격, 폰트)
[ ] TypeScript 에러 없음
[ ] console.log 제거
[ ] 불필요한 주석 제거
[ ] 파일 크기 제한 준수 (300줄)
[ ] 네이밍 규칙 준수
[ ] 에러 핸들링 포함
[ ] 접근성 고려 (aria-label 등)
```

### 리뷰어 체크리스트
```
[ ] 코드 컨벤션 준수
[ ] 스타일 가이드 준수
[ ] 로직 정확성
[ ] 성능 이슈 없음
[ ] 보안 이슈 없음
[ ] 테스트 가능성
```

---

## 유용한 VSCode 설정

### `.vscode/settings.json`
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### `.vscode/extensions.json`
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## 참고 문서
- [PRD.md](./PRD.md) - 제품 요구사항
- [style_guide.md](./style_guide.md) - 디자인 스타일 가이드
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - 데이터베이스 스키마
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**마지막 업데이트:** 2025-11-21  
**버전:** 1.0.0
