// ========== 공통 타입 정의 ==========

export interface Review {
  id: string;
  product_id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  sentiment?: SentimentResult;
  keywords?: string[];
}

export interface SentimentResult {
  label: "positive" | "negative" | "neutral";
  score: number;
}

export interface AnalysisResult {
  productId: string;
  totalReviews: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: KeywordItem[];
  trend: TrendItem[];
  summary: string;
}

export interface KeywordItem {
  text: string;
  value: number;
  sentiment: "positive" | "negative" | "neutral";
}

export interface TrendItem {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  url: string;
  platform: "coupang" | "amazon";
  image_url?: string;
  review_count: number;
  last_analyzed_at?: string;
  created_at: string;
}

export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResult {
  product: {
    name: string;
    platform: "coupang" | "amazon";
    image_url?: string;
  };
  reviews: {
    author: string;
    rating: number;
    content: string;
    date: string;
  }[];
}
