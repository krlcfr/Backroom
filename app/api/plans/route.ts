import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "BE-36 Get Plan — Pendiente" });
}
