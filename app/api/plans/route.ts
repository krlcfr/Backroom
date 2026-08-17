import { NextResponse } from "next/server";

// GET /api/plans — M-11 Planes/Facturación (backlog, HU-FUT-13)
// Stub deshabilitado: sin planes en MVP v8.0 (DT-21, R-06, R-11)
export async function GET() {
  return NextResponse.json({ message: "Planes no disponibles en MVP (backlog)" });
}
