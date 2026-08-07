import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";

// GET /api/demo/backroom — Devuelve la estructura de ejemplo del BackRoom Demo
export async function GET() {
  try {
    await requireAuth();

    const demoData = {
      backroom: {
        id: "demo-backroom-001",
        nombre: "Mi Primer BackRoom (Demo)",
        descripcion: "Un espacio de prueba para explorar la plataforma.",
        portada_url: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop",
      },
      tree: [
        {
          id: "demo-sala-001",
          nombre: "Matemáticas Discretas",
          descripcion: "Apuntes y ejercicios de la clase.",
          depth: 0,
          children: [
            {
              id: "demo-sala-002",
              nombre: "Unidad 1: Lógica",
              descripcion: "Tablas de verdad y proposiciones.",
              depth: 1,
              children: [
                {
                  id: "demo-sala-003",
                  nombre: "Ejercicios Resueltos",
                  descripcion: "Práctica para el parcial.",
                  depth: 2,
                  children: [],
                }
              ]
            },
            {
              id: "demo-sala-004",
              nombre: "Unidad 2: Conjuntos",
              descripcion: "Teoría de conjuntos.",
              depth: 1,
              children: [],
            }
          ]
        },
        {
          id: "demo-sala-005",
          nombre: "Programación Web",
          descripcion: "Recursos de frontend y backend.",
          depth: 0,
          children: [],
        }
      ],
      sample_resources: [
        {
          id: "demo-rec-001",
          sala_id: "demo-sala-002",
          nombre: "Resumen_Logica.docx",
          tipo: "docx",
          url: "https://example.com/demo.docx",
          tamano_bytes: 1048576, // 1 MB
          subido_por: "Usuario Demo",
          created_at: new Date().toISOString(),
        },
        {
          id: "demo-rec-002",
          sala_id: "demo-sala-005",
          nombre: "Tutorial Next.js",
          tipo: "enlace",
          url: "https://nextjs.org/docs",
          tamano_bytes: null,
          subido_por: "Usuario Demo",
          created_at: new Date().toISOString(),
        }
      ]
    };

    return NextResponse.json({ data: demoData }, { status: 200 });
  } catch (error) {
    // Si no está autenticado, devuelve 401
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Inicia sesión para ver la Demo." } },
      { status: 401 }
    );
  }
}
