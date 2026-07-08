import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "BE-21 List Recursos — Pendiente" });
}

export async function POST() {
  return NextResponse.json({ message: "BE-20 Upload Recurso — Pendiente" });
}
