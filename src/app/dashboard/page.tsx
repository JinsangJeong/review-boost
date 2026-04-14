import ReviewScraper from "@/components/ui/ReviewScraper";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            📊 ReviewBoost
          </h1>
          <span className="text-sm text-gray-500">대시보드</span>
        </div>
      </header>

      {/* 메인 */}
      <main className="px-4 py-8">
        <ReviewScraper />
      </main>
    </div>
  );
}
