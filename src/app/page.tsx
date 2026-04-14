import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            📊 ReviewBoost
          </h1>
          <nav className="flex gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              대시보드
            </Link>
          </nav>
        </div>
      </header>

      {/* 히어로 */}
      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            AI 기반 리뷰 인사이트
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            리뷰에서<br />
            <span className="text-blue-600">진짜 인사이트</span>를 찾다
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            쿠팡·아마존 리뷰 수백 개를 AI가 분석해서 감정, 키워드, 트렌드를 한눈에 보여드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              지금 시작하기 →
            </Link>
          </div>
        </div>

        {/* 기능 소개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              URL만 입력하세요
            </h3>
            <p className="text-sm text-gray-500">
              쿠팡, 아마존 상품 URL을 넣으면 자동으로 리뷰를 수집합니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI 감정 분석
            </h3>
            <p className="text-sm text-gray-500">
              GPT-4o-mini가 각 리뷰의 감정과 키워드를 정밀하게 분석합니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              대시보드 시각화
            </h3>
            <p className="text-sm text-gray-500">
              감정 분포, 키워드 클라우드, 트렌드 차트로 한눈에 파악합니다.
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          ReviewBoost — AI 이커머스 리뷰 분석기
        </div>
      </footer>
    </div>
  );
}
