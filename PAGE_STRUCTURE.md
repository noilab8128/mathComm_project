# MathComm 페이지 구조 및 관계 문서

## 📋 목차
1. [전체 구조 개요](#전체-구조-개요)
2. [메인 라우팅 시스템](#메인-라우팅-시스템)
3. [각 페이지 상세 설명](#각-페이지-상세-설명)
4. [데이터 흐름](#데이터-흐름)
5. [필터링 로직](#필터링-로직)
6. [컴포넌트 관계도](#컴포넌트-관계도)

---

## 전체 구조 개요

### 애플리케이션 아키텍처
```
src/
├── app/
│   ├── page.tsx              # 메인 라우터 (모든 페이지 통합)
│   ├── admin/
│   │   └── problems/
│   │       └── page.tsx       # 관리자 문제 관리 페이지
│   └── api/                   # API 라우트
│       ├── preview/
│       ├── analyze-problem/
│       ├── generate-related-problems/
│       └── generate-solution/
├── components/
│   ├── MainPage.tsx           # 메인 페이지 (올림피아드 문제)
│   ├── Dashboard.tsx          # 대시보드
│   ├── Problems.tsx           # 문제 목록 페이지
│   ├── SkillTree.tsx          # 스킬 트리
│   ├── Stats.tsx              # 통계 페이지
│   ├── Community.tsx          # 커뮤니티
│   └── ui/                    # 공통 UI 컴포넌트
└── lib/
    ├── supabase.ts            # Supabase API 클라이언트
    └── learningSync.tsx      # 학습 동기화 훅
```

---

## 메인 라우팅 시스템

### `src/app/page.tsx` - 중앙 라우터

**역할**: 모든 페이지를 통합하고 네비게이션을 관리하는 메인 컴포넌트

**주요 기능**:
1. **상태 관리**
   ```typescript
   const [page, setPage] = useState("main");  // 현재 활성 페이지
   const [communityTab, setCommunityTab] = useState<CommunityTab>("discussions");
   ```

2. **페이지 라우팅 맵**
   | 라우트 키 | 컴포넌트 | 설명 |
   |---------|---------|------|
   | `"main"` | `MainPage` | 홈 페이지 (올림피아드 문제) |
   | `"dashboard"` | `Dashboard` | 사용자 대시보드 |
   | `"skill-tree"` | `SkillTree` | 스킬 트리 시각화 |
   | `"problems"` | `Problems` | 전체 문제 목록 |
   | `"stats"` | `Stats` | 통계 페이지 |
   | `"community"` | `Community` | 커뮤니티 (토론/리더보드) |

3. **네비게이션 이벤트 처리**
   - `CustomEvent`를 통한 페이지 간 통신
   - `sessionStorage`를 통한 문제 선택 상태 전달
   ```typescript
   window.addEventListener('navigate-to-page', handleNavigate);
   ```

4. **레이아웃 구조**
   ```
   ┌─────────────────────────────────────┐
   │ TopBar (검색, 빠른 액션)            │
   ├──────────┬──────────────────────────┤
   │ SideNav  │ Main Content Area        │
   │ (메뉴)   │ (조건부 렌더링)          │
   │          │                          │
   │          │ - MainPage               │
   │          │ - Dashboard              │
   │          │ - Problems               │
   │          │ - SkillTree              │
   │          │ - Stats                  │
   │          │ - Community              │
   └──────────┴──────────────────────────┘
   ```

---

## 각 페이지 상세 설명

### 1. MainPage (`src/components/MainPage.tsx`)

**목적**: 올림피아드 문제를 트리 구조로 표시하는 메인 랜딩 페이지

**주요 기능**:

#### 📊 데이터 페칭
```typescript
// 1. 모든 문제 가져오기
const supabaseProblems = await problemsAPI.getAll();

// 2. 올림피아드 문제 필터링
const olympiad = supabaseProblems.filter(p => {
  const isOlympiadLevel = p.level === "Olympiad";
  const isOlympiadDifficulty = p.difficulty >= 10;
  const wouldBeOlympiad = getDifficultyLabel(p.difficulty) === "Olympiad";
  return isOlympiadLevel || isOlympiadDifficulty || wouldBeOlympiad;
});
```

#### 🌳 문제 트리 구축
- **재귀적 트리 구조**: `parent_problem_id`를 기반으로 계층 구조 생성
- **최대 깊이**: 3단계로 제한
- **트리 시각화**: 
  - 루트 문제: 노란색/황금색 그라데이션
  - 1단계 자식: 파란색/인디고 그라데이션
  - 2단계 이상: 흰색 배경

#### 🎨 UI 특징
- 히어로 섹션: 노란색-주황색 그라데이션 배경
- 문제 카드: 각 올림피아드 문제마다 카드 생성
- 스크롤 가능한 트리 뷰: 최대 높이 600px
- 문제 수 표시: 각 트리의 문제 개수 배지

**필터링 로직**:
```typescript
// 올림피아드 문제 판별 조건 (3가지 중 하나라도 만족)
1. level 필드가 "Olympiad"로 명시적으로 설정됨
2. difficulty >= 10 (최고 난이도)
3. getDifficultyLabel(difficulty) === "Olympiad"
```

---

### 2. Dashboard (`src/components/Dashboard.tsx`)

**목적**: 사용자 진행 상황, 추천 문제, 리더보드를 보여주는 종합 대시보드

**주요 기능**:

#### 📈 통계 표시
- 사용자 진행률 (Progress Bar)
- 주제별 숙련도 차트 (BarChart)
- 주간 리더보드

#### 🌲 학습 경로 시각화
- `buildLearningPaths()` 함수로 계층 구조 생성
- 수평 레이아웃:
  - Level 0 (왼쪽): 루트 문제 (x: 150)
  - Level 1 (중앙): 파생 문제 (x: 450)
  - Level 2 (오른쪽): 손자 문제 (x: 750)

#### 🔗 문제 관계 구축
```typescript
// parent_problem_id 기반 계층 구조
const rootProblems = problems.filter(p => !p.parent_problem_id);
const derivedProblems = problems.filter(p => p.parent_problem_id === rootProblem.id);
```

#### 🎯 추천 문제
- 사용자 레벨에 맞는 문제 추천
- 문제 클릭 시 `Problems` 페이지로 자동 이동
- `sessionStorage`를 통한 문제 선택 상태 전달

**데이터 흐름**:
```
Supabase → problemsAPI.getAll() 
         → buildLearningPaths() 
         → SkillNode[] 생성 
         → Canvas 렌더링
```

---

### 3. Problems (`src/components/Problems.tsx`)

**목적**: 모든 문제를 필터링하고 탐색할 수 있는 문제 목록 페이지

**주요 기능**:

#### 🔍 필터링 시스템
```typescript
// 필터 상태
const [selectedLevel, setSelectedLevel] = useState("All");
const [selectedAge, setSelectedAge] = useState("All");

// 필터링 로직
const filteredProblems = problems.filter(problem => {
  const levelMatch = selectedLevel === "All" || problem.level === selectedLevel;
  const ageMatch = selectedAge === "All" || problem.age === selectedAge;
  return levelMatch && ageMatch;
});
```

#### 📋 동적 필터 옵션 생성
```typescript
// 문제 데이터에서 고유한 레벨과 나이 추출
const levels = ["All", ...new Set(problems.map(p => p.level).filter(Boolean))];
const ages = ["All", ...new Set(problems.map(p => p.age).filter(Boolean))];
```

#### 🔓 문제 잠금 해제 정책
- **모든 문제 잠금 해제**: 계층 구조와 관계없이 모든 문제 접근 가능
```typescript
converted.unlocked = true;  // 강제로 모든 문제 잠금 해제
```

#### 🔄 자동 문제 열기
- `sessionStorage`에서 `selectedProblemId` 확인
- 문제가 로드되면 자동으로 다이얼로그 열기
- 스크롤 및 버튼 클릭 자동화

**문제 표시 우선순위**:
1. 올림피아드 문제: 노란색 테두리 및 배경
2. 초보자 문제: 초록색 테두리 및 배경
3. 기타: 기본 스타일

---

### 4. SkillTree (`src/components/SkillTree.tsx`)

**목적**: 학습 경로를 인터랙티브하게 시각화하는 스킬 트리

**주요 기능**:

#### 🎨 캔버스 조작
- **줌**: 마우스 휠 또는 버튼 (0.3x ~ 3x)
- **팬/드래그**: 마우스로 캔버스 이동
- **노드 클릭**: 문제 목록 표시

#### 📊 데이터 로딩
```typescript
// 배치 처리로 효율적인 관계 데이터 로딩
const batchSize = 10;
for (let i = 0; i < supabaseProblems.length; i += batchSize) {
  const batch = supabaseProblems.slice(i, i + batchSize);
  await Promise.all(
    batch.map(async (problem) => {
      const relationships = await problemRelationshipsAPI.getLearningPath(problem.id);
      allRelationships.push(...relationships);
    })
  );
}
```

#### 🔗 문제 관계 API
- `problemRelationshipsAPI.getLearningPath(problemId)`: 문제의 모든 관계 가져오기
- 관계 타입: `prerequisite`, `derived`, `related`, `next`, `alternative`

---

### 5. Stats (`src/components/Stats.tsx`)

**목적**: 사용자 통계 및 성과 분석

**주요 기능**:
- 문제 해결 통계
- XP 획득 추이
- 주제별 성과 분석

---

### 6. Community (`src/components/Community.tsx`)

**목적**: 커뮤니티 기능 (토론, 리더보드)

**주요 기능**:
- **토론 (Discussions)**: 문제별 댓글 및 토론
- **리더보드 (Leaderboard)**: 사용자 순위 및 점수

**탭 시스템**:
```typescript
type CommunityTab = "discussions" | "leaderboard";
const [communityTab, setCommunityTab] = useState<CommunityTab>("discussions");
```

---

## 데이터 흐름

### 1. 문제 데이터 흐름

```
┌─────────────┐
│  Supabase   │
│  Database   │
└──────┬──────┘
       │
       │ problemsAPI.getAll()
       │
       ▼
┌─────────────────┐
│ SupabaseProblem │  (원본 데이터)
│ - id            │
│ - title         │
│ - difficulty    │
│ - level         │
│ - parent_problem_id
└──────┬──────────┘
       │
       │ convertSupabaseProblem()
       │
       ▼
┌─────────────────┐
│ ProblemDisplay  │  (표시용 데이터)
│ - id            │
│ - title         │
│ - difficulty    │
│ - level         │
│ - unlocked      │
│ - xp            │
└──────┬──────────┘
       │
       │ 필터링/변환
       │
       ▼
┌─────────────────┐
│   UI 렌더링     │
│ - Cards         │
│ - Trees         │
│ - Lists         │
└─────────────────┘
```

### 2. 페이지 간 데이터 전달

#### 방법 1: CustomEvent
```typescript
// Dashboard에서 Problems로 이동
const event = new CustomEvent('navigate-to-page', { 
  detail: { page: 'problems', problemId: problem.id } 
});
window.dispatchEvent(event);
```

#### 방법 2: sessionStorage
```typescript
// 문제 선택 상태 저장
sessionStorage.setItem('selectedProblemId', problem.id);

// Problems 페이지에서 읽기
const selectedProblemId = sessionStorage.getItem('selectedProblemId');
```

### 3. 문제 관계 데이터 흐름

```
┌──────────────────────┐
│ problem_relationships│
│ 테이블               │
└──────────┬───────────┘
           │
           │ problemRelationshipsAPI.getLearningPath()
           │
           ▼
┌──────────────────────┐
│ Relationship[]       │
│ - source_problem_id  │
│ - target_problem_id  │
│ - relationship_type  │
└──────────┬───────────┘
           │
           │ buildLearningPaths()
           │
           ▼
┌──────────────────────┐
│ SkillNode[]          │
│ - id                 │
│ - x, y (좌표)        │
│ - problems[]         │
└──────────┬───────────┘
           │
           │ Canvas 렌더링
           │
           ▼
┌──────────────────────┐
│ 시각화된 스킬 트리    │
└──────────────────────┘
```

---

## 필터링 로직

### 1. 올림피아드 문제 필터링 (MainPage)

**위치**: `src/components/MainPage.tsx`

**로직**:
```typescript
const olympiad = supabaseProblems.filter(p => {
  // 조건 1: level 필드가 명시적으로 "Olympiad"
  const isOlympiadLevel = p.level === "Olympiad";
  
  // 조건 2: difficulty가 10 이상 (최고 난이도)
  const isOlympiadDifficulty = p.difficulty >= 10;
  
  // 조건 3: difficulty 레이블이 "Olympiad"로 변환됨
  const wouldBeOlympiad = getDifficultyLabel(p.difficulty) === "Olympiad";
  
  // 세 조건 중 하나라도 만족하면 올림피아드 문제
  return isOlympiadLevel || isOlympiadDifficulty || wouldBeOlympiad;
});
```

**난이도 레이블 변환 규칙** (`getDifficultyLabel`):
- `difficulty <= 3`: "Easy"
- `difficulty <= 6`: "Medium"
- `difficulty <= 9`: "Hard"
- `difficulty >= 10`: "Olympiad"

### 2. 문제 목록 필터링 (Problems)

**위치**: `src/components/Problems.tsx`

**로직**:
```typescript
const filteredProblems = problems.filter(problem => {
  // 레벨 필터: "All"이거나 선택한 레벨과 일치
  const levelMatch = selectedLevel === "All" || problem.level === selectedLevel;
  
  // 나이 필터: "All"이거나 선택한 나이와 일치
  const ageMatch = selectedAge === "All" || problem.age === selectedAge;
  
  // 두 조건 모두 만족해야 표시
  return levelMatch && ageMatch;
});
```

**동적 필터 옵션**:
```typescript
// 문제 데이터에서 고유한 값 추출
const levels = ["All", ...new Set(problems.map(p => p.level).filter(Boolean))];
const ages = ["All", ...new Set(problems.map(p => p.age).filter(Boolean))];
```

### 3. 관리자 페이지 필터링 (Admin)

**위치**: `src/app/admin/problems/page.tsx`

**로직**:
```typescript
const filteredProblems = problems
  .filter(p => {
    // 루트 문제만 표시 (파생 문제 제외)
    const isRootProblem = !p.parentProblemId;
    
    // 검색 필터
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 카테고리 필터
    const matchesCategory = filterCategory === "all" || 
                           p.category.toLowerCase().includes(filterCategory.toLowerCase());
    
    // 난이도 필터
    let matchesDifficulty = true;
    if (filterDifficulty === "easy") matchesDifficulty = p.difficulty <= 3;
    else if (filterDifficulty === "medium") matchesDifficulty = p.difficulty >= 4 && p.difficulty <= 6;
    else if (filterDifficulty === "hard") matchesDifficulty = p.difficulty >= 7 && p.difficulty <= 9;
    else if (filterDifficulty === "olympic") matchesDifficulty = p.difficulty === 10;
    
    return isRootProblem && matchesSearch && matchesCategory && matchesDifficulty;
  })
  .sort((a, b) => {
    // 정렬 로직
    if (sortBy === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
    else if (sortBy === "title") return a.title.localeCompare(b.title);
    else if (sortBy === "difficulty") return b.difficulty - a.difficulty;
    return 0;
  });
```

---

## 컴포넌트 관계도

```
                    ┌─────────────────┐
                    │   page.tsx      │
                    │  (라우터)       │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  MainPage    │    │  Dashboard   │    │  Problems    │
│              │    │              │    │              │
│ - 올림피아드  │    │ - 통계        │    │ - 전체 문제   │
│   문제 필터링 │    │ - 추천 문제   │    │ - 레벨/나이   │
│ - 트리 구축  │    │ - 스킬 트리   │    │   필터링     │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  supabase.ts    │
                  │  (API 클라이언트)│
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Supabase DB   │
                  │   - problems    │
                  │   - categories  │
                  │   - relationships
                  └─────────────────┘
```

### 컴포넌트 의존성

```
MainPage
  ├── problemsAPI.getAll()
  ├── getDifficultyLabel()
  ├── MathPreview
  └── UI Components (Card, Badge, Button, Dialog, ScrollArea)

Dashboard
  ├── problemsAPI.getAll()
  ├── problemRelationshipsAPI.getLearningPath()
  ├── buildLearningPaths()
  ├── MathPreview
  └── UI Components

Problems
  ├── problemsAPI.getAll()
  ├── getDifficultyLabel()
  ├── MathPreview
  └── UI Components

SkillTree
  ├── problemsAPI.getAll()
  ├── problemRelationshipsAPI.getLearningPath()
  ├── buildLearningPaths()
  └── UI Components
```

---

## 주요 유틸리티 함수

### 1. `getDifficultyLabel(difficulty: number): string`
**위치**: `src/lib/supabase.ts`

**역할**: 숫자 난이도를 텍스트 레이블로 변환

**로직**:
```typescript
if (difficulty <= 3) return 'Easy';
if (difficulty <= 6) return 'Medium';
if (difficulty <= 9) return 'Hard';
return 'Olympiad';
```

### 2. `convertSupabaseProblem(sp: SupabaseProblem): ProblemDisplay`
**위치**: 각 컴포넌트 내부

**역할**: Supabase 문제 데이터를 UI 표시용 형식으로 변환

**변환 내용**:
- `difficulty` → `getDifficultyLabel()`로 변환
- `age_range` → 기본값 "All Ages" 설정
- `xp` → `difficulty * 50` 계산
- `tags` → `category_path`에서 추출
- `unlocked` → 항상 `true` (계층 제한 없음)

### 3. `buildLearningPaths(problems, relationships)`
**위치**: `src/components/Dashboard.tsx`

**역할**: 문제 배열을 계층적 노드 구조로 변환

**로직**:
1. 루트 문제 찾기 (`parent_problem_id`가 없는 문제)
2. 각 루트에 대해 재귀적으로 자식 문제 찾기
3. 노드와 엣지 배열 생성
4. 좌표 계산 (수평 레이아웃)

---

## 상태 관리

### 전역 상태
- **페이지 라우팅**: `page.tsx`의 `useState("main")`
- **커뮤니티 탭**: `page.tsx`의 `useState<CommunityTab>("discussions")`

### 로컬 상태 (각 컴포넌트)
- **문제 목록**: `useState<ProblemDisplay[]>([])`
- **로딩 상태**: `useState<boolean>(true)`
- **에러 상태**: `useState<string | null>(null)`
- **필터 상태**: `useState<string>("All")`

### 세션 스토리지
- `selectedProblemId`: 페이지 간 문제 선택 상태 전달

---

## API 엔드포인트

### Supabase API (`src/lib/supabase.ts`)

#### `problemsAPI`
- `getAll()`: 모든 문제 가져오기
- `getById(id)`: 특정 문제 가져오기
- `create(problem)`: 문제 생성
- `update(id, problem)`: 문제 업데이트
- `delete(id)`: 문제 삭제
- `filter(filters)`: 필터링된 문제 가져오기

#### `problemRelationshipsAPI`
- `create()`: 문제 관계 생성
- `getBySourceProblem()`: 소스 문제의 관계 가져오기
- `getDerivedProblems()`: 파생 문제 가져오기
- `getLearningPath()`: 학습 경로 가져오기
- `getNextProblems()`: 다음 문제 가져오기

### Next.js API Routes (`src/app/api/`)

- `/api/preview`: LaTeX/Markdown 미리보기 렌더링
- `/api/analyze-problem`: 문제 분석
- `/api/generate-related-problems`: 관련 문제 생성
- `/api/generate-solution`: 해답 생성

---

## 주요 설계 패턴

### 1. 조건부 렌더링 패턴
```typescript
{page === "main" && <MainPage />}
{page === "dashboard" && <Dashboard />}
```

### 2. 이벤트 기반 통신
```typescript
// 발신
window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: { page: 'problems' } }));

// 수신
window.addEventListener('navigate-to-page', handleNavigate);
```

### 3. 재귀적 트리 구축
```typescript
const findChildren = (parentId: string, depth: number = 0): void => {
  if (depth > 3) return; // 최대 깊이 제한
  const children = problems.filter(p => p.parent_problem_id === parentId);
  children.forEach(child => {
    findChildren(child.id, depth + 1); // 재귀 호출
  });
};
```

### 4. 배치 처리 패턴
```typescript
const batchSize = 10;
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);
  await Promise.all(batch.map(processItem));
}
```

---

## 성능 최적화

### 1. 메모이제이션
- `useMemo`를 사용한 위치 계산 캐싱
- `React.useMemo(() => Object.fromEntries(...), [skillNodes])`

### 2. 배치 로딩
- 관계 데이터를 10개씩 배치로 로딩
- `Promise.all`로 병렬 처리

### 3. 지연 로딩
- 문제 콘텐츠는 다이얼로그가 열릴 때만 로드
- LaTeX 렌더링은 필요할 때만 API 호출

### 4. 깊이 제한
- 트리 구조는 최대 3단계로 제한
- 무한 재귀 방지

---

## 향후 개선 사항

1. **상태 관리 라이브러리 도입**
   - Redux 또는 Zustand로 전역 상태 관리
   - 페이지 간 데이터 공유 개선

2. **캐싱 전략**
   - React Query로 서버 상태 캐싱
   - 불필요한 API 호출 감소

3. **가상화**
   - 긴 목록에 React Virtual 사용
   - 렌더링 성능 개선

4. **타입 안정성**
   - 더 엄격한 TypeScript 타입 정의
   - 런타임 에러 감소

---

## 참고 문서

- `DATABASE_SCHEMA.md`: 데이터베이스 스키마 상세
- `PRD.md`: 제품 요구사항 문서
- `LEARNING_PATH_DESIGN.md`: 학습 경로 설계 문서
- `IMPLEMENTATION_SUMMARY.md`: 구현 요약

---

**최종 업데이트**: 2025-01-10
**작성자**: AI Assistant
**버전**: 1.0

