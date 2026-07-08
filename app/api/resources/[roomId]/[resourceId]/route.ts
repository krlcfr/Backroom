import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "BE-22 Get Recurso — Pendiente" });
}

export async function DELETE() {
  return NextResponse.json({ message: "BE-23 Delete Recurso — Pendiente" });
}
