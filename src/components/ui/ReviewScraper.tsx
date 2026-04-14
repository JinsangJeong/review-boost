"use client";

import { useState } from "react";
import { ScrapeResult, AnalysisResult } from "@/types";
import AnalysisDashboard from "./AnalysisDashboard";

export default function ReviewScraper() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState<
    "idle" | "scraping" | "analyzing" | "done" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError("");
    setScrapeResult(null);
    setAnalysis(null);

    // Step 1: 리뷰 수집
    setLoading("scraping");
    try {
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!scrapeRes.ok) {
        const err = await scrapeRes.json();
        throw new Error(err.error || "리뷰 수집에 실패했습니다.");
      }

      const scrapeData: ScrapeResult = await scrapeRes.json();
      setScrapeResult(scrapeData);

      // Step 2: AI 분석
      setLoading("analyzing");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scrapeData),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || "분석에 실패했습니다.");
      }

      const analyzeData: AnalysisResult = await analyzeRes.json();
      analyzeData.productId = scrapeData.product.name;
      setAnalysis(analyzeData);
      setLoading("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setLoading("error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* URL 입력 폼 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🔍 리뷰 분석하기
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          쿠팡 또는 아마존 상품 URL을 입력하면 AI가 리뷰를 분석합니다.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.coupang.com/vp/products/..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            disabled={loading === "scraping" || loading === "analyzing"}
          />
          <button
            type="submit"
            disabled={loading === "scraping" || loading === "analyzing"}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading === "scraping"
              ? "수집 중..."
              : loading === "analyzing"
                ? "분석 중..."
                : "분석 시작"}
          </button>
        </form>

        {/* 데모 버튼 */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() =>
              setUrl("https://www.coupang.com/vp/products/7254200675")
            }
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            쿠팡 데모 URL
          </button>
          <button
            type="button"
            onClick={() =>
              setUrl("https://www.amazon.com/dp/B0C1H27D3B")
            }
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            아마존 데모 URL
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 수집 결과 미리보기 */}
      {scrapeResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📦 수집된 리뷰
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {scrapeResult.product.platform === "coupang" ? "쿠팡" : "아마존"}
            </span>
            <span className="text-gray-700 font-medium">
              {scrapeResult.product.name}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            총 {scrapeResult.reviews.length}개의 리뷰를 수집했습니다.
          </p>
          <div className="max-h-60 overflow-y-auto space-y-3">
            {scrapeResult.reviews.slice(0, 5).map((review, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">
                    {review.author}
                  </span>
                  <span className="text-yellow-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="text-gray-400 text-xs">{review.date}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{review.content}</p>
              </div>
            ))}
            {scrapeResult.reviews.length > 5 && (
              <p className="text-xs text-gray-400 text-center">
                외 {scrapeResult.reviews.length - 5}개 더보기
              </p>
            )}
          </div>
        </div>
      )}

      {/* 로딩 애니메이션 */}
      {(loading === "scraping" || loading === "analyzing") && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600">
            {loading === "scraping"
              ? "리뷰를 수집하고 있습니다..."
              : "AI가 리뷰를 분석하고 있습니다..."}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {loading === "scraping"
              ? "상품 페이지에서 리뷰를 가져오는 중"
              : "GPT-4o-mini가 감정과 키워드를 분석 중"}
          </p>
        </div>
      )}

      {/* 분석 결과 대시보드 */}
      {analysis && <AnalysisDashboard analysis={analysis} />}
    </div>
  );
}
