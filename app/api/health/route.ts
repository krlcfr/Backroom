import { NextResponse } from "next/server";

// GET /api/health — Health check público
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
