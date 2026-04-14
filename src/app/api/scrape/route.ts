import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, scrapeCoupangReviews, scrapeAmazonReviews } from "@/lib/scrapers";
import type { ScrapeResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body as { url: string };

    if (!url) {
      return NextResponse.json({ error: "URL을 입력해주세요." }, { status: 400 });
    }

    const platform = detectPlatform(url);
    if (!platform) {
      return NextResponse.json(
        { error: "지원하지 않는 플랫폼입니다. 쿠팡 또는 아마존 URL을 입력해주세요." },
        { status: 400 }
      );
    }

    let result: ScrapeResult;
    if (platform === "coupang") {
      result = await scrapeCoupangReviews(url);
    } else {
      result = await scrapeAmazonReviews(url);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "리뷰 수집 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
