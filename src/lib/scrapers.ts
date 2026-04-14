import { ScrapeResult } from "@/types";

/**
 * URL에서 플랫폼 감지
 */
export function detectPlatform(url: string): "coupang" | "amazon" | null {
  if (url.includes("coupang.com")) return "coupang";
  if (url.includes("amazon.com") || url.includes("amazon.")) return "amazon";
  return null;
}

/**
 * 쿠팡 리뷰 스크래핑
 * 실제 프로덕션에서는 Puppeteer/Playwright 필요.
 * MVP에서는 데모 데이터 반환.
 */
export async function scrapeCoupangReviews(url: string): Promise<ScrapeResult> {
  // TODO: 실제 스크래핑 구현 (Puppeteer 필요)
  // MVP에서는 데모 데이터로 동작 확인
  const productId = url.match(/vp\/products\/(\d+)/)?.[1] || "unknown";

  return {
    product: {
      name: `쿠팡 상품 #${productId}`,
      platform: "coupang",
    },
    reviews: generateDemoReviews("coupang", productId),
  };
}

/**
 * 아마존 리뷰 스크래핑
 * 실제 프로덕션에서는 Puppeteer/Playwright 필요.
 * MVP에서는 데모 데이터 반환.
 */
export async function scrapeAmazonReviews(url: string): Promise<ScrapeResult> {
  // TODO: 실제 스크래핑 구현 (Puppeteer 필요)
  const asin = url.match(/\/dp\/([A-Z0-9]+)/)?.[1] || "unknown";

  return {
    product: {
      name: `Amazon Product #${asin}`,
      platform: "amazon",
    },
    reviews: generateDemoReviews("amazon", asin),
  };
}

/**
 * 데모 리뷰 데이터 생성 ( MVP용 )
 */
function generateDemoReviews(
  platform: "coupang" | "amazon",
  id: string
): ScrapeResult["reviews"] {
  const positiveReviews = [
    "배송이 정말 빠르네요! 다음날 바로 도착했습니다. 포장도 꼼꼼하게 잘 되어 있어서 만족합니다.",
    "가격 대비 품질이 정말 좋아요. 재구매 의사 100%입니다!",
    " 생각보다 훨씬 좋은 제품이에요. 주변에도 추천했어요.",
    "사용하기 편하고 디자인도 깔끔합니다. 만족스러운 구매였어요.",
    "이 가격에 이 품질이면 대박이에요. 정말 추천합니다!",
    "두 번째 구매입니다. 역시 만족합니다.",
    "리뷰 보고 샀는데 기대 이상이에요! 좋은 제품 감사합니다.",
    "가성비 최고! 다른 제품 쓰다가 갈아탔는데 만족합니다.",
  ];

  const negativeReviews = [
    "배송이 너무 늦었어요. 일주일이나 걸렸습니다.",
    "사이즈가 생각보다 작아요. 상세 설명이 부정확한 것 같아요.",
    "포장이 엉망이었어요. 박스가 찌그러져서 왔습니다.",
    "품질이 영 아닙니다. 한 달도 안 돼서 고장 났어요.",
    "환불 처리가 너무 느립니다. 아직도 환불 못 받았어요.",
    "색상이 화면과 많이 다르네요. 실망입니다.",
    "고객센터 연결이 안 돼요. 불만 접수도 못 하겠어요.",
    "재구매 안 합니다. 품질이 너무 떨어져요.",
  ];

  const neutralReviews = [
    "보통이에요. 특별히 좋지도 나쁘지도 않습니다.",
    "가격 정도의 품질인 것 같아요.",
    "빠른 배송은 좋았는데 제품은 그저 그래요.",
    "재구매 할지 말지 고민 중이에요.",
    "평범한 제품입니다. 특별한 장단점 없어요.",
    "기대했던 것보다는 좀 아쉽지만 나쁘지 않아요.",
  ];

  const reviews: ScrapeResult["reviews"] = [];
  const allReviews = [
    ...positiveReviews.map((r) => ({
      content: r,
      sentiment: "positive" as const,
    })),
    ...negativeReviews.map((r) => ({
      content: r,
      sentiment: "negative" as const,
    })),
    ...neutralReviews.map((r) => ({
      content: r,
      sentiment: "neutral" as const,
    })),
  ];

  // 30~50개의 리뷰 생성
  const count = 30 + Math.floor(Math.random() * 20);
  for (let i = 0; i < count; i++) {
    const review = allReviews[Math.floor(Math.random() * allReviews.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const rating =
      review.sentiment === "positive"
        ? 4 + Math.floor(Math.random() * 2)
        : review.sentiment === "negative"
          ? 1 + Math.floor(Math.random() * 2)
          : 3;

    reviews.push({
      author: `${platform === "coupang" ? "쿠" : "아"}${id.slice(0, 3)}***`,
      rating,
      content: review.content,
      date: date.toISOString().split("T")[0],
    });
  }

  return reviews.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
