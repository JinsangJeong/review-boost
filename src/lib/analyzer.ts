import OpenAI from "openai";
import { AnalysisResult, KeywordItem, TrendItem, ScrapeResult } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GPT-4o-mini로 리뷰 분석
 */
export async function analyzeReviews(
  scrapeResult: ScrapeResult
): Promise<AnalysisResult> {
  const reviews = scrapeResult.reviews;

  // 리뷰 내용을 배치로 GPT에 전달
  const batchSize = 20;
  const allAnalyses: {
    sentiment: "positive" | "negative" | "neutral";
    keywords: string[];
  }[] = [];

  for (let i = 0; i < reviews.length; i += batchSize) {
    const batch = reviews.slice(i, i + batchSize);
    const batchText = batch
      .map((r, idx) => `[${idx + 1}] 별점:${r.rating} | "${r.content}"`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 이커머스 리뷰 분석 전문가입니다. 
각 리뷰에 대해 다음을 분석하세요:
1. 감정 (positive/negative/neutral)
2. 핵심 키워드 (1~3개, 한국어)

반드시 아래 JSON 형식으로만 응답하세요:
[{"sentiment":"positive","keywords":["배송","가성비"]}, ...]

리뷰 개수와 동일한 길이의 배열을 반환하세요.`,
        },
        {
          role: "user",
          content: `다음 리뷰들을 분석해주세요:\n\n${batchText}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "[]";
    try {
      const parsed = JSON.parse(content);
      allAnalyses.push(...parsed);
    } catch {
      // 파싱 실패 시 기본값
      for (let j = 0; j < batch.length; j++) {
        allAnalyses.push({ sentiment: "neutral", keywords: [] });
      }
    }
  }

  // 감정 분포 계산
  const sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
  allAnalyses.forEach((a) => {
    sentimentDistribution[a.sentiment]++;
  });

  // 키워드 빈도 집계
  const keywordMap = new Map<string, { count: number; sentiment: Map<string, number> }>();
  allAnalyses.forEach((a) => {
    a.keywords.forEach((kw) => {
      if (!keywordMap.has(kw)) {
        keywordMap.set(kw, { count: 0, sentiment: new Map() });
      }
      const entry = keywordMap.get(kw)!;
      entry.count++;
      entry.sentiment.set(
        a.sentiment,
        (entry.sentiment.get(a.sentiment) || 0) + 1
      );
    });
  });

  // 키워드 아이템 생성
  const keywords: KeywordItem[] = Array.from(keywordMap.entries())
    .map(([text, data]) => {
      const dominant = Array.from(data.sentiment.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] as "positive" | "negative" | "neutral";
      return { text, value: data.count, sentiment: dominant };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);

  // 날짜별 트렌드 계산
  const trendMap = new Map<string, { positive: number; negative: number; neutral: number }>();
  reviews.forEach((review, idx) => {
    const analysis = allAnalyses[idx];
    if (!analysis) return;

    const date = review.date;
    if (!trendMap.has(date)) {
      trendMap.set(date, { positive: 0, negative: 0, neutral: 0 });
    }
    trendMap.get(date)![analysis.sentiment]++;
  });

  const trend: TrendItem[] = Array.from(trendMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 요약 생성
  const summary = await generateSummary(
    scrapeResult.product.name,
    reviews.length,
    sentimentDistribution,
    keywords.slice(0, 10)
  );

  return {
    productId: "",
    totalReviews: reviews.length,
    sentimentDistribution,
    keywords,
    trend,
    summary,
  };
}

/**
 * 분석 요약 생성
 */
async function generateSummary(
  productName: string,
  totalReviews: number,
  sentiment: { positive: number; negative: number; neutral: number },
  topKeywords: KeywordItem[]
): Promise<string> {
  const positivePercent = Math.round(
    (sentiment.positive / totalReviews) * 100
  );
  const negativePercent = Math.round(
    (sentiment.negative / totalReviews) * 100
  );

  const positiveKws = topKeywords
    .filter((k) => k.sentiment === "positive")
    .map((k) => k.text)
    .slice(0, 3);
  const negativeKws = topKeywords
    .filter((k) => k.sentiment === "negative")
    .map((k) => k.text)
    .slice(0, 3);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "이커머스 리뷰 분석 리포트를 작성하는 AI입니다. 한국어로 2~3문장으로 핵심만 요약하세요.",
      },
      {
        role: "user",
        content: `상품: ${productName}
전체 리뷰: ${totalReviews}개
긍정: ${positivePercent}%, 부정: ${negativePercent}%
긍정 키워드: ${positiveKws.join(", ")}
부정 키워드: ${negativeKws.join(", ")}

핵심 인사이트를 요약해주세요.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content || "분석 요약을 생성하지 못했습니다.";
}
