import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";

// GET /api/demo/backroom — Devuelve la estructura de ejemplo del BackRoom Demo
export async function GET() {
  try {
    await requireAuth();

    const now = new Date();
    const ayer = new Date(now);
    ayer.setDate(now.getDate() - 1);

    const demoData = {
      backroom: {
        id: "demo-backroom-001",
        nombre: "BackRoom Demo",
        descripcion: "Espacio de prueba para explorar la plataforma.",
        portada_url: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop",
      },
      tree: [
        {
          id: "demo-sala-001",
          nombre: "Reportes Financieros",
          descripcion: "Análisis trimestrales y métricas de rendimiento.",
          acceso: "publico",
          icono: "analytics",
          depth: 0,
          children: [],
        },
        {
          id: "demo-sala-002",
          nombre: "Recursos Humanos",
          descripcion: "Contratos, nóminas y evaluaciones de personal.",
          acceso: "restringido",
          icono: "group",
          depth: 0,
          children: [],
        },
      ],
      sample_resources: [
        {
          id: "demo-rec-001",
          sala_id: "demo-sala-001",
          nombre: "Q3_Financial_Report.pdf",
          tipo: "pdf",
          url: "https://example.com/demo.pdf",
          tamano_bytes: Math.round(4.2 * 1024 * 1024),
          subido_por: "Ana Silva",
          created_at: now.toISOString(),
        },
        {
          id: "demo-rec-002",
          sala_id: "demo-sala-001",
          nombre: "Pitch_Deck_2026.pptx",
          tipo: "pptx",
          url: "https://example.com/demo.pptx",
          tamano_bytes: Math.round(12.5 * 1024 * 1024),
          subido_por: "Carlos Ruiz",
          created_at: ayer.toISOString(),
        },
        {
          id: "demo-rec-003",
          sala_id: "demo-sala-001",
          nombre: "Dashboard_Analiticas_URL",
          tipo: "enlace",
          url: "https://example.com/dashboard",
          tamano_bytes: null,
          subido_por: "Admin",
          created_at: "2023-10-05T09:00:00.000Z",
        },
        {
          id: "demo-rec-004",
          sala_id: "demo-sala-002",
          nombre: "Reunion_Directorio.mp3",
          tipo: "mp3",
          url: "https://example.com/demo.mp3",
          tamano_bytes: Math.round(45 * 1024 * 1024),
          subido_por: "Sistema",
          created_at: "2023-10-12T11:30:00.000Z",
        },
        {
          id: "demo-rec-005",
          sala_id: "demo-sala-002",
          nombre: "Demo_Producto.mp4",
          tipo: "mp4",
          url: "https://example.com/demo.mp4",
          tamano_bytes: Math.round(45 * 1024 * 1024),
          subido_por: "Laura Gómez",
          created_at: "2023-10-10T15:45:00.000Z",
        },
      ]
    };

    return NextResponse.json({ data: demoData }, { status: 200 });
  } catch {
    // Si no está autenticado, devuelve 401
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Inicia sesión para ver la Demo." } },
      { status: 401 }
    );
  }
}
