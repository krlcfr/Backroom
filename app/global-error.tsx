"use client";

// global-error.tsx — captura errores en el root layout
// Debe incluir <html> y <body> porque reemplaza el layout completo.

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4"
            style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: "440px" }}>
          <p style={{
            fontSize: "6rem", fontWeight: 900, lineHeight: 1,
            background: "linear-gradient(to right, #a78bfa, #818cf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            500
          </p>
          <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginTop: "1rem" }}>
            Error crítico
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0.75rem 0 2rem" }}>
            Ocurrió un error inesperado. Por favor recarga la página o contacta al soporte.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.25rem", borderRadius: "0.75rem",
                background: "#7c3aed", color: "#fff", border: "none",
                fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
              }}
            >
              Reintentar
            </button>
            <a
              href="/"
              style={{
                padding: "0.625rem 1.25rem", borderRadius: "0.75rem",
                background: "rgba(255,255,255,0.05)", color: "#cbd5e1",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
              }}
            >
              Volver al inicio
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#374151", fontFamily: "monospace" }}>
              ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
