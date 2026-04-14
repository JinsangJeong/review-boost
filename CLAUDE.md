# ReviewBoost — Agent Guidelines

Next.js 16 + Supabase + OpenAI 기반 한국 이커머스 리뷰 분석 SaaS. 쿠팡/아마존 리뷰를 GPT-4o-mini로 감정·키워드 분석하여 대시보드로 시각화.

## 시작 전 반드시 읽을 것

- `docs/ROADMAP.md` — 전체 전략과 Phase 구조 (MVP 완성 → 수익화)
- `docs/STATUS.md` — 지금 진행 중인 Phase와 체크리스트

둘 중 어느 쪽이든 지금 작업과 충돌하면 **작업을 멈추고 확인**한다.

## 스택

- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4
- Supabase (Postgres + Auth + RLS)
- OpenAI GPT-4o-mini (감정·키워드·요약)
- Recharts 3 (시각화)
- Vercel 배포 전제

## 필수 컨벤션

### Supabase 클라이언트 — 용도별 분리

Phase 1 이후 `src/lib/supabase.ts` 단일 파일은 삭제되고 다음 4개로 분할됨. **반드시 용도에 맞는 것을 import한다.**

| 파일 | 언제 | 주의 |
|---|---|---|
| `src/lib/supabase/client.ts` | `"use client"` 컴포넌트/훅 | `NEXT_PUBLIC_*` 키만 접근 |
| `src/lib/supabase/server.ts` | 서버 컴포넌트, Route Handler, Server Action | cookies 바인딩으로 RLS 자동 적용 — **1순위 선택지** |
| `src/lib/supabase/admin.ts` | service-role 필요 작업 (webhook, cron) | RLS 우회됨. 남용 금지. 새 코드에서 쓸 일 있으면 먼저 서버 클라이언트로 가능한지 재검토 |
| `src/lib/supabase/middleware.ts` | `updateSession(request)` 헬퍼 | middleware.ts에서만 호출 |

`@supabase/ssr` 0.10+는 `getAll/setAll` 쿠키 인터페이스를 쓴다. 구 `get/set/remove`로 짜면 세션 리프레시가 조용히 실패한다.

### API Route 체크리스트

새 API Route를 만들거나 수정할 때 **최상단에 순서대로**:

1. `const supabase = await createServerClient()` (cookies 바인딩)
2. `const { data: { user } } = await supabase.auth.getUser()` — 없으면 `401`
3. (Phase 5 이후) `lib/billing/enforce.ts`의 `canCreateProduct` / `canRunAnalysis` 게이트 호출 — 실패 시 `402` + `{code:'PLAN_LIMIT'}`
4. 본 로직은 서버 클라이언트로 DB 접근 (RLS가 `user_id` 소유권 자동 검증)
5. 성공 후 usage 카운터 증가 (`incrementUsage`)

`body.user_id` 신뢰 금지. 항상 `auth.getUser()`로 주입.

### 재사용할 기존 자산 (수정 금지 또는 최소화)

- `src/lib/analyzer.ts` `analyzeReviews()` / `generateSummary()` — 배치 GPT 호출 로직. **재작성 금지**, 시그니처 미세 조정만.
- `src/components/ui/AnalysisDashboard.tsx` — 시각화 컴포넌트. 새 페이지에서 그대로 import.
- `src/lib/scrapers.ts` `detectPlatform()`, `generateDemoReviews()` — 플랫폼 감지 + `APIFY_TOKEN` 미설정 시 데모 폴백으로 계속 사용.
- `supabase/schema.sql` 기존 products/reviews/analyses 테이블 + RLS — 그대로 유지. 새 테이블은 `supabase/migrations/` 에 넘버링된 파일로 추가.

### 금지 사항

- `body.user_id`를 그대로 DB에 insert — RLS 우회 시도로 간주
- 클라이언트 컴포넌트에서 `supabase/admin.ts` import — 빌드 에러 나야 정상
- `service_role` 키를 `NEXT_PUBLIC_*` 로 노출 — 치명적
- `billing_keys.billing_key` 컬럼을 클라이언트로 내려보내기 — PCI 위반 리스크
- Playwright/Puppeteer를 Vercel API Route에서 직접 실행 (250MB, 60s 한계). 스크래핑은 Apify Actor 경유.

## Git 워크플로우

**판단 기준 한 줄**: "되돌리고 싶어질 가능성이 있으면 브랜치."

### 브랜치 필요

- 새 기능 구현 (Phase 작업 전부)
- 버그 수정
- 리팩토링
- 의존성 추가 (`package.json` 변경)
- DB 마이그레이션 추가

브랜치명: `phase-1-auth`, `fix/scrape-timeout`, `feat/kakao-oauth` 정도로. 엄격한 규칙은 없지만 Phase 단위 작업은 `phase-N-*` 패턴 선호.

### main 직접 커밋 OK

- 오타/주석/README 문구 수정
- `.gitignore` 한 줄 추가
- `CLAUDE.md` / `docs/ROADMAP.md` / `docs/STATUS.md` 업데이트
- 빌드 즉시 복구 (CI 깨진 것 원복)

### 애매한 경우

요청 받으면 먼저 "이건 브랜치 감인가?" 스스로 판단한다. 애매하면 사용자에게 **"브랜치 만들까요, 아니면 main에서 바로 할까요?"** 한 번 묻고 진행한다. 침묵으로 결정하지 않는다.

커밋은 항상 새로 만든다 (amend 금지, 사용자가 명시 요청 시 예외). `--no-verify` 등 훅 우회도 요청 없이는 금지.

## 개발 명령어

```bash
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run lint       # ESLint
```

현재 테스트 러너 없음. 추가 시 이 섹션 갱신.

## 환경변수

`.env.example` 유지보수 필수. 신규 변수는 항상 예시값과 함께 `.env.example`에도 추가.

민감 변수 (서버 전용, 절대 `NEXT_PUBLIC_*` 금지):
`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `PORTONE_API_SECRET`, `PORTONE_WEBHOOK_SECRET`, `APIFY_TOKEN`, `APIFY_WEBHOOK_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`

## 파일 생성 규칙

- 라우트 그룹: 인증 영역 `(auth)`, 법률 `(legal)`, 마케팅 `(marketing)` — URL에 반영 안 됨
- 컴포넌트: 기능별 디렉토리 (`components/landing/`, `components/billing/`, `components/ui/`)
- 빌링 로직은 전부 `src/lib/billing/` 밑에 (portone/subscriptions/enforce/proration)
- 스크래핑 외부 연동은 `src/lib/scraping/` (apify.ts 등)
- 새 DB 테이블: `supabase/migrations/000N_description.sql` 넘버링 순서 유지

## 한국 시장 주의

- 가격 표기 "₩29,000/월 (VAT 별도)"
- 전자상거래법 사업자 정보 페이지 필수 (`/info`)
- 마케팅 이메일 수신 동의 분리, 21:00~08:00 발송 금지, 제목 `(광고)` 프리픽스
- 개인정보처리방침에 OpenAI·Resend 등 **국외이전** 별도 명시
- KST 기준 cron (Vercel cron은 UTC라 시간 변환 주의)
