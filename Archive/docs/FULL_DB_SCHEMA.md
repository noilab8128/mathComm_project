# MathQuest Database Schema Specification

본 문서는 MathQuest 애플리케이션의 전체 데이터베이스 구조를 정리한 공식 명세서입니다. Supabase (PostgreSQL) 엔진을 기반으로 하며, 사용자 인증, 문제 은행, 학습 이력, 관리자 기능 등 모든 도메인을 포함합니다.

---

## 1. 개요 (Overview)

데이터베이스는 크게 두 개의 주요 스키마로 구성됩니다:
- **`next_auth`**: 사용자 인증 및 세션 데이터 (NextAuth.js 연동)
- **`public`**: 문제 도메인, 유저 학습 데이터, 서비스 운영 관련 데이터

---

## 2. 사용자 및 인증 (Schema: `next_auth`)

사용자 고유 정보와 로그인 수단을 관리합니다.

### 👤 `users` (사용자 통합 정보)
기본 프로필에 온보딩 및 초기 분석 데이터를 확장하여 저장합니다.

| 컬럼명 | 타입 | 설명 |
|---|---|---|
| [id](file:///Users/cyanc/mathComm_project/src/app/admin/problems/components/ProblemEditor.tsx#245-250) | `uuid` (PK) | 고유 식별자 |
| `name` | `text` | 실명 또는 표시 이름 |
| `email` | `text` (Unique) | 로그인 이메일 |
| `emailVerified` | `timestamptz` | 이메일 인증 시각 |
| `image` | `text` | 프로필 이미지 URL |
| `password_hash` | `text` | 자격 증명(Credentials) 로그인용 암호화 해시 |
| `is_onboarded` | `boolean` | 온보딩 프로세스 완료 여부 |
| `role_type` | `text` | 가입 시 선택한 역할 (Student, Teacher 등) |
| `goals` | `text[]` | 학습 목표 (예: IMO, SAT) |
| `interested_categories` | `text[]` | 관심 수학 분야 리스트 |
| `category_levels` | `jsonb` | 온보딩 시 자가 진단한 카테고리별 초기 레벨 정보 |

### 🔗 `accounts` / `sessions` / `verification_tokens`
NextAuth 처리를 위한 표준 테이블들입니다. 소셜 로그인(Google, Facebook) 연동 및 세션 유지를 담당합니다.

---

## 3. 문제 도메인 (Schema: `public`)

문제 은행과 고도화된 계층 관계를 관리합니다.

### 📱 `categories` (수학 분류 체계)
수학의 방대한 개념을 대-중-소 계층(Tree)으로 관리합니다.

| 컬럼명 | 타입 | 설명 |
|---|---|---|
| `category_id` | `int` (PK) | 고유 ID |
| `name` | `text` | 분야 명칭 (예: 함수, 미분) |
| `level` | `int` | 계층 뎁스 (1~3) |
| `parent_id` | `int` (FK) | 부모 카테고리 참조 |

### 📝 `problems` (문제 메인)
수학 문제 본문과 각종 통계, 메타데이터를 담습니다.

| 컬럼명 | 타입 | 설명 |
|---|---|---|
| [id](file:///Users/cyanc/mathComm_project/src/app/admin/problems/components/ProblemEditor.tsx#245-250) | `uuid` (PK) | 문제 고유 식별자 |
| `title` / `content` | `text` | 제목 및 문제 내용 (KaTeX/Markdown) |
| `difficulty` | `int` | 난이도 (1-10) |
| `is_generated` | `boolean` | AI 생성 파생 문제 여부 |
| `tags` / `concepts` | `text[]` | 검색용 태그 및 포함된 개념들 |
| `source` | `text` | 문제 출처 (Moem, IMO 등) |
| `starts_count` / `completes_count` | `bigint` | 풀이 시도/완료 통계 |

### 💡 `solutions` (해설)
한 문제에 대해 여러 단계의 해설(Step)을 지원하는 1:N 구조입니다.

### 🌳 `problem_hierarchies`
- **Hierarchies**: 부모 문제에서 파생된 하위 문제 간의 부모-자식 계층 관리. 이 테이블이 기존의 모든 문제 관계 지정을 대체합니다.

---

## 4. 학습 데이터 및 평가 (Schema: `public`)

유저의 실력 성장과 리더보드를 관리합니다.

### 📊 `user_category_levels` / `history`
유저의 실력을 가장 세부적인 카테고리(Leaf Node) 단위로 추적합니다.
- `user_category_levels`: 현재 시점의 실력 상태.
- `user_category_level_history`: 시간이 흐름에 따른 실력 변화 로그.

### 🛡️ `submissions` / `user_progress`
- `submissions`: 유저가 제출한 답변 본문과 채점 결과(Score, XP).
- `user_progress`: 유저별 문제 잠금 해제(Unlocked) 및 완료 상태 대시보드.

---

## 5. 관리 및 운영 (Schema: `public`)

### 🔑 `user_roles` (권한 관리)
시스템 어드민 권한을 관리합니다.
- `user_id`: 유저 아이디 (FK)
- `role`: 'admin', 'user', 'moderator' 등

### 📢 `notices` (공지사항)
앱 내 공지사항 게시판 데이터입니다.
- `is_published`: 게시 여부 필터링 지원.

---

## 6. 특수 뷰 (Views: `public`)

### 🔄 `vw_user_category_levels`
재귀 쿼리(Recursive CTE)를 통해 **가장 하위 노드의 점수를 바탕으로 상위 카테고리의 평균 점수를 실시간으로 계산**하여 제공합니다. UI에서 유저의 전체 실력 지도를 그릴 때 사용됩니다.
