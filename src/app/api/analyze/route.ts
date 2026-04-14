import { NextRequest, NextResponse } from "next/server";
import { analyzeReviews } from "@/lib/analyzer";
import type { ScrapeResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scrapeResult = body as ScrapeResult;

    if (!scrapeResult?.reviews?.length) {
      return NextResponse.json(
        { error: "분석할 리뷰 데이터가 없습니다." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-your-openai-api-key") {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다. .env.local을 확인해주세요." },
        { status: 500 }
      );
    }

    const analysis = await analyzeReviews(scrapeResult);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "리뷰 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
