# ReviewBoost 📊

AI 이커머스 리뷰 분석기 — 쿠팡·아마존 리뷰를 AI가 분석하여 감정, 키워드, 트렌드를 대시보드로 보여줍니다.

## 기능

- **URL 입력으로 리뷰 수집** — 쿠팡/아마존 상품 URL만 입력하면 자동 수집
- **AI 감정 분석** — GPT-4o-mini가 각 리뷰의 긍정/부정/중립 감정 분석
- **키워드 추출** — 리뷰에서 핵심 키워드 자동 추출 및 감정 매핑
- **대시보드 시각화** — 감정 분포 파이차트, 키워드 클라우드, 감정 트렌드 라인차트
- **분석 요약** — AI가 2~3문장으로 핵심 인사이트 요약

## 기술 스택

- **프론트엔드**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **백엔드**: Next.js API Routes
- **AI**: OpenAI GPT-4o-mini
- **차트**: Recharts
- **DB/Auth**: Supabase

## 빠른 시작

```bash
# 1. 의존성 설치
npm install --include=dev

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local에 실제 API 키 입력

# 3. 개발 서버 실행
npm run dev
```

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 |
| `OPENAI_API_KEY` | OpenAI API 키 (GPT-4o-mini) |

## Supabase 설정

`supabase/schema.sql`을 Supabase SQL Editor에서 실행하세요.

### 테이블 구조

- **products** — 분석 대상 상품
- **reviews** — 수집된 리뷰
- **analyses** — 분석 결과 캐시

## MVP 현황

- [x] Next.js 프로젝트 세팅 (App Router, TypeScript, Tailwind)
- [x] Supabase 스키마 설계
- [x] 리뷰 수집 API (데모 데이터 — 실제 스크래핑은 Puppeteer 필요)
- [x] AI 분석 API (GPT-4o-mini 감정/키워드 분석)
- [x] 대시보드 UI (감정 파이차트, 키워드 클라우드, 트렌드 라인차트)
- [x] .env.example 파일
- [ ] 실제 쿠팡/아마존 스크래핑 (Puppeteer 구현 필요)
- [ ] Supabase Auth 연동
- [ ] 결과 저장/불러오기

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── scrape/route.ts      # 리뷰 수집 API
│   │   ├── analyze/route.ts     # AI 분석 API
│   │   └── products/route.ts    # 상품 CRUD API
│   ├── dashboard/page.tsx        # 대시보드 페이지
│   └── page.tsx                  # 랜딩 페이지
├── components/ui/
│   ├── AnalysisDashboard.tsx     # 분석 결과 대시보드
│   └── ReviewScraper.tsx         # URL 입력 + 분석 플로우
├── lib/
│   ├── analyzer.ts               # GPT-4o-mini 분석 로직
│   ├── scrapers.ts               # 리뷰 스크래핑 로직
│   └── supabase.ts               # Supabase 클라이언트
├── types/index.ts                 # 공통 타입 정의
└── supabase/
    └── schema.sql                 # DB 스키마
```

## 라이선스

Private — 상업적 사용 불가
