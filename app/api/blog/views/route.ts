import { NextRequest, NextResponse } from "next/server";
import { incrementViews, getAllViews } from "@/lib/blog-views";

// GET - get all views (for admin)
export async function GET() {
  try {
    const views = await getAllViews();
    return NextResponse.json(views);
  } catch (error) {
    console.error("Error getting views:", error);
    return NextResponse.json({ error: "Failed to get views" }, { status: 500 });
  }
}

// POST - increment view count
export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const views = await incrementViews(slug);
    return NextResponse.json({ views });
  } catch (error) {
    console.error("Error incrementing views:", error);
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 });
  }
}
