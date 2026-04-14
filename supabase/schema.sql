-- ReviewBoost DB Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products 테이블
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('coupang', 'amazon')),
  image_url TEXT,
  review_count INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews 테이블
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  author TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  date DATE,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses 테이블 (분석 결과 캐시)
CREATE TABLE analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  total_reviews INTEGER NOT NULL,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  keywords JSONB DEFAULT '[]',
  trend JSONB DEFAULT '[]',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_analyses_product_id ON analyses(product_id);
CREATE INDEX idx_reviews_date ON reviews(date);

-- RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 상품만 조회/수정/삭제 가능
CREATE POLICY "Users can manage their own products" ON products
  FOR ALL USING (auth.uid() = user_id);

-- 리뷰는 상품 소유자만 조회 가능
CREATE POLICY "Users can view reviews of their products" ON reviews
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );

-- 분석 결과는 상품 소유자만 조회 가능
CREATE POLICY "Users can view analyses of their products" ON analyses
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );
