"use client";

import { AnalysisResult } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#f59e0b",
};

interface Props {
  analysis: AnalysisResult;
}

export default function AnalysisDashboard({ analysis }: Props) {
  const sentimentData = [
    { name: "긍정", value: analysis.sentimentDistribution.positive, fill: COLORS.positive },
    { name: "부정", value: analysis.sentimentDistribution.negative, fill: COLORS.negative },
    { name: "중립", value: analysis.sentimentDistribution.neutral, fill: COLORS.neutral },
  ];

  const trendData = analysis.trend.map((item) => ({
    ...item,
    긍정: item.positive,
    부정: item.negative,
    중립: item.neutral,
  }));

  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-medium mb-2">📊 분석 요약</h3>
        <p className="text-sm leading-relaxed">{analysis.summary}</p>
        <div className="mt-4 flex gap-6 text-sm">
          <span>총 리뷰 {analysis.totalReviews}개</span>
          <span>
            긍정 {Math.round((analysis.sentimentDistribution.positive / analysis.totalReviews) * 100)}%
          </span>
          <span>
            부정 {Math.round((analysis.sentimentDistribution.negative / analysis.totalReviews) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 감정 분포 파이차트 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            감정 분포
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 키워드 워드클라우드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            주요 키워드
          </h3>
          <div className="flex flex-wrap gap-2 justify-center items-center min-h-[300px]">
            {analysis.keywords.slice(0, 30).map((kw, idx) => {
              const maxVal = analysis.keywords[0].value;
              const size = Math.max(14, Math.min(40, (kw.value / maxVal) * 40));
              return (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full font-medium transition-transform hover:scale-110 cursor-default"
                  style={{
                    fontSize: `${size}px`,
                    backgroundColor: `${COLORS[kw.sentiment]}20`,
                    color: COLORS[kw.sentiment],
                    border: `1px solid ${COLORS[kw.sentiment]}40`,
                  }}
                >
                  {kw.text}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 감정 트렌드 차트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          감정 트렌드
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="긍정"
              stroke={COLORS.positive}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="부정"
              stroke={COLORS.negative}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="중립"
              stroke={COLORS.neutral}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 키워드 상세 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          키워드 상세
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-600">키워드</th>
                <th className="text-left py-2 px-3 text-gray-600">빈도</th>
                <th className="text-left py-2 px-3 text-gray-600">감정</th>
              </tr>
            </thead>
            <tbody>
              {analysis.keywords.slice(0, 20).map((kw, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium">{kw.text}</td>
                  <td className="py-2 px-3">{kw.value}회</td>
                  <td className="py-2 px-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${COLORS[kw.sentiment]}20`,
                        color: COLORS[kw.sentiment],
                      }}
                    >
                      {kw.sentiment === "positive"
                        ? "긍정"
                        : kw.sentiment === "negative"
                          ? "부정"
                          : "중립"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
