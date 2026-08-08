import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  field?: string;

  constructor(status: number, message: string, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, ...(error.field ? { campo: error.field } : {}) },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Datos invalidos", detalles: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  console.error(error);
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
