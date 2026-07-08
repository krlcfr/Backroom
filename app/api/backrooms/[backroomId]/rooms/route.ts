import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "BE-18 List Salas — Pendiente" });
}

export async function POST() {
  return NextResponse.json({ message: "BE-17 Create Sala — Pendiente" });
}
