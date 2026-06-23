"use client";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin crash]", error);
  }, [error]);

  return (
    <div style={{ fontFamily: "monospace", padding: 32, background: "#0f0e17", color: "#f5f0e8", minHeight: "100vh" }}>
      <h1 style={{ color: "#c9a84c", marginBottom: 16 }}>Error en el panel admin</h1>
      <pre style={{ background: "#1a1b1f", padding: 16, borderRadius: 8, overflowX: "auto", color: "#ff6b6b", fontSize: 13 }}>
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: 24, padding: "8px 20px", background: "#c9a84c", color: "#0f0e17", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
      >
        Reintentar
      </button>
    </div>
  );
}
