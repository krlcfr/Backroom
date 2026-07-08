import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "BE-14 Get BackRoom — Pendiente" });
}

export async function DELETE() {
  return NextResponse.json({ message: "BE-15 Delete BackRoom — Pendiente" });
}
