import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ message: "BE-28 Update Permiso — Pendiente" });
}

export async function DELETE() {
  return NextResponse.json({ message: "BE-29 Remove Miembro — Pendiente" });
}
