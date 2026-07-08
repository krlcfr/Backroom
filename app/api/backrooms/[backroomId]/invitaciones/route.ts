import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "BE-32 List Invitaciones — Pendiente" });
}

export async function POST() {
  return NextResponse.json({ message: "BE-31 Generate Invitacion — Pendiente" });
}
