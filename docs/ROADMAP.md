# ReviewBoost Roadmap

MVP에서 수익화 가능한 구독형 SaaS까지의 단계별 계획. 전략 문서 — 변경 빈도 낮음. 현재 진행 상황은 [`STATUS.md`](./STATUS.md) 참고.

## Context

현재 상태: 데모 데이터 기반 MVP. 랜딩 + `/dashboard` + GPT 감정·키워드 분석 + Recharts 시각화. DB 스키마(products/reviews/analyses + RLS)는 준비되어 있으나 실제로 저장되지 않음. 인증·실제 스크래핑·결제·사용량 제한 전부 미구현.

목표: 한국 이커머스 셀러 대상 구독형 SaaS로 론칭 가능한 상태. 기획 가격 = Starter 29,000원 / Pro 59,000원 / Business 99,000원 (월, VAT 별도).

## 확정 전략

1. **MVP 완성 우선, 수익화는 그 다음.** Phase 1~4로 "유저가 실제로 쓸 수 있는 상태"를 먼저 만들고, Phase 5에서 결제·게이팅을 얹는다.
2. **결제 PG = 포트원 V2 + 토스 채널.** 국내 B2B SaaS 표준. 빌링키 정기결제 + PG 스위칭 자유도 + 세금계산서 연동 용이.
3. **스크래핑 = Apify Actor API.** 쿠팡/아마존 공식 유지 액터 사용. 월 $1~5. `APIFY_TOKEN` 미설정 시 `generateDemoReviews()` 폴백 유지.
4. **인증 = 이메일/비번 + Google OAuth + 카카오 OAuth.** 카카오는 Supabase 기본 미지원이라 Custom OAuth 수동 설정.

## Phase 개요

| Phase | 기간 | 산출물 | Gate |
|---|---|---|---|
| 1. Auth 하드닝 | 1~2일 | 3종 로그인 + middleware 보호 + 기존 API 인증 | 비로그인 `/dashboard` 접근 시 `/login` redirect |
| 2. DB 저장 플로우 | 1~2일 | `/api/scrape`·`/api/analyze` 결과 영구 저장, 내 상품 목록/상세 | 새로고침·재로그인 후에도 분석 결과 유지, 타유저 데이터 차단 |
| 3. Apify 실 스크래핑 | 2일 | 쿠팡/아마존 실 리뷰 수집 + webhook + 데모 폴백 | 실 URL → 2~3분 내 실 리뷰 insert |
| 4. 랜딩 개선 | 0.5일 | `/pricing` + 법률 페이지 + 섹션 분할 | 모든 섹션 렌더 + "Pro 시작하기" → `/signup?plan=pro` |
| **MVP 완성** | **~6일** | **실제 유저 받을 수 있는 상태** | |
| 5. 결제/플랜 게이팅 | 4~5일 | 포트원 구독 + 쿼터 + webhook + cron | Free 쿼터 초과 → UpgradeModal, 테스트 카드로 Pro 구독 성공 |
| **수익화 완료** | **~11일** | **유료 구독 전환 가능** | |
| 6. Growth/운영 | 선택 | 이메일 시퀀스 + Sentry/PostHog + 공개 데모 + API | 우선순위는 수익 데이터에 따라 결정 |

## Phase 상세

### Phase 1 — Auth 하드닝

- `src/lib/supabase.ts` → `client.ts`/`server.ts`/`admin.ts`/`middleware.ts` 4분할
- `src/middleware.ts` 신규 — `/dashboard`, `/api/scrape`, `/api/analyze`, `/api/products` 보호
- `src/app/(auth)/login|signup/page.tsx`, `callback/route.ts`
- 카카오: Kakao Developers 앱 생성 → Supabase Custom OAuth (authorize/token/userinfo URL 등록)
- 기존 `/api/products` POST에서 `body.user_id` 제거, `auth.getUser()`로 주입. service-role 전체 조회 GET은 보안 구멍이므로 서버 클라이언트로 교체.

### Phase 2 — DB 저장/불러오기

- `/api/scrape`: products upsert `UNIQUE(user_id, url)` + reviews bulk insert → `{productId}`
- `/api/analyze`: `{productId}` 받아 reviews 조회 → `analyzer.ts`의 `analyzeReviews()` 재사용 → reviews 업데이트 + analyses insert
- `/api/products/[id]` (GET/DELETE), `/api/products/[id]/analyses` (GET/POST)
- `src/app/dashboard/layout.tsx`, `dashboard/products/page.tsx`, `dashboard/products/[id]/page.tsx` (AnalysisDashboard 재사용)
- 함정: bulk insert 8MB 한계 → 1000개 이상 청크 분할. `/api/analyze`는 배치마다 DB 즉시 저장해 60s 타임아웃 시 복구 가능하게.

### Phase 3 — Apify 스크래핑

- `src/lib/scraping/apify.ts` — `runCoupangScraper`, `runAmazonScraper`, `fetchRunResults`, `verifyApifyWebhook`
- `src/app/api/webhooks/apify/route.ts` — HMAC 검증 후 runId로 결과 가져와 reviews insert + analyze 트리거
- `src/lib/scrapers.ts` — 기존 함수를 Apify 호출로 교체, 토큰 없으면 `generateDemoReviews()` 폴백
- `vercel.json` — `maxDuration: 60`
- 비동기 패턴: client `POST /api/scrape` → products(status=scraping) + Apify async run → webhook 완료 → analyze → client polling

### Phase 4 — 랜딩 개선

- `src/components/landing/` Hero/Features/Screenshot/Pricing/FAQ/Footer 분할
- `src/app/(legal)/terms|privacy|info/page.tsx` — 전자상거래법 사업자 정보는 실 론칭 전 필수
- 가격 표기 "VAT 별도" 명시

### Phase 5 — 결제/플랜 게이팅

- `supabase/migrations/0002_billing.sql` — plans / billing_keys / subscriptions / invoices / usage_counters + trigger(신규 유저 free 구독 자동 생성)
- `src/lib/billing/` — portone.ts (SDK 래퍼), subscriptions.ts (생성/변경/해지), enforce.ts (게이트), proration.ts
- `src/app/pricing/page.tsx`, `checkout/page.tsx`, `checkout/complete/page.tsx`
- `src/app/api/billing/` — subscribe, change-plan, cancel
- `src/app/api/webhooks/portone/route.ts` — 서명검증 + 멱등
- `src/app/api/cron/` — billing (01:00 KST), dunning (02:00), trial-expiring (09:00). 전부 `CRON_SECRET` Bearer 검증
- `/api/scrape`·`/api/analyze` 상단에 게이트 삽입, 402 응답 시 프론트에서 UpgradeModal 표시

### Phase 6 — Growth/운영 (수익 발생 후 선별)

우선순위 순:
- Resend 환영/D1/D3 + 주간 리포트 (도메인 SPF/DKIM/DMARC 필수)
- Sentry + PostHog 이벤트 5종
- Upstash Ratelimit (analyze/scrape)
- `/demo` 공개 체험 (IP 쿼터) + `/share/[token]` 공유 스냅샷
- 카카오 알림톡 (결제 고지)
- 공개 API v1 (Business 특전)

## Critical Files

- `src/lib/supabase.ts` → 4파일로 분할 (Phase 1)
- `src/middleware.ts` (Phase 1 신규, 모든 요청 관통)
- `src/app/api/scrape/route.ts` / `src/app/api/analyze/route.ts` (Phase 1·2·5에서 반복 수정)
- `supabase/migrations/0002_billing.sql` (Phase 5 신규)
- `src/lib/billing/portone.ts` + `enforce.ts` (Phase 5 신규)
- `src/app/api/webhooks/portone/route.ts` + `webhooks/apify/route.ts` (Phase 3·5 신규)
- `vercel.json` (Phase 3 신규)

## 재사용 자산

| 자산 | 경로 | 재사용 방식 |
|---|---|---|
| 분석 로직 | `src/lib/analyzer.ts` | 시그니처 미세 조정만. 배치 GPT 호출 로직 보존 |
| 시각화 | `src/components/ui/AnalysisDashboard.tsx` | 그대로 사용 |
| 플랫폼 감지 | `src/lib/scrapers.ts` `detectPlatform()` | 그대로 |
| 데모 폴백 | `src/lib/scrapers.ts` `generateDemoReviews()` | `APIFY_TOKEN` 없을 때 폴백 |
| DB 스키마 | `supabase/schema.sql` | 그대로 + 넘버링 migration 추가 |

## Changelog

Phase 완료 시 한 줄 기록. `STATUS.md`의 완료된 체크리스트는 여기로 흡수 후 삭제.

_(아직 없음)_
