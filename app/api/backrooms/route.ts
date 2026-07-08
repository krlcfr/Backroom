import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "BE-13 List BackRooms — Pendiente" });
}

export async function POST() {
  return NextResponse.json({ message: "BE-12 Create BackRoom — Pendiente" });
}
