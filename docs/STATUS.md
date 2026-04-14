# Status

현재 진행 중인 Phase만 추적한다. 완료된 Phase는 [`ROADMAP.md`](./ROADMAP.md) Changelog로 한 줄 흡수 후 이 파일에서 삭제한다. 파일이 길어지면 lie가 된다 — 짧게 유지한다.

---

## 현재: Phase 1 — Auth 하드닝

**목표**: 이메일/Google/카카오 로그인으로 `/dashboard` 접근. 비로그인 차단.

### 작업 체크리스트

- [ ] `src/lib/supabase.ts` 삭제 후 `src/lib/supabase/{client,server,admin,middleware}.ts` 4분할
- [ ] 기존 `src/lib/supabase.ts` import 전수 교체 (grep으로 확인)
- [ ] `src/middleware.ts` 신규 — 세션 리프레시 + 보호 라우트 redirect
- [ ] `src/app/(auth)/login/page.tsx` — 이메일+비번 + Google + 카카오
- [ ] `src/app/(auth)/signup/page.tsx`
- [ ] `src/app/(auth)/callback/route.ts` — `exchangeCodeForSession`
- [ ] `src/app/api/auth/signout/route.ts`
- [ ] Supabase Dashboard — Google OAuth provider 활성화 + redirect URL 등록 _(콘솔 작업, 코드 아님)_
- [ ] Kakao Developers 앱 생성 + Supabase Custom OAuth 등록 _(콘솔 작업)_
- [ ] `src/app/api/products/route.ts` — `body.user_id` 제거하고 `auth.getUser()`로 주입, service-role GET을 서버 클라이언트 RLS 기반으로 교체
- [ ] `.env.example` 업데이트 (신규 변수 있으면)

### Gate (이걸 전부 통과해야 Phase 1 완료)

- [ ] `http://localhost:3000/dashboard` 비로그인 접근 → `/login`으로 redirect
- [ ] 이메일 회원가입 → `/dashboard` 접근 성공
- [ ] Google 로그인 → `/dashboard` 접근 성공
- [ ] 카카오 로그인 → `/dashboard` 접근 성공
- [ ] Supabase Studio `auth.users` 테이블에 각 로그인별 row 확인
- [ ] 로그아웃 후 `/dashboard` 재접근 → 다시 `/login`으로 redirect
- [ ] `/api/products` GET이 자기 상품만 반환 (다른 계정으로 확인)

### 다음

Phase 1 Gate 전부 통과 후 → Phase 2 (DB 저장/불러오기). `ROADMAP.md`에서 상세 확인.
