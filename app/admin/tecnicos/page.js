"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminTecnicosPage() {
  const supabase = createSupabaseBrowserClient();
  const [perfil, setPerfil] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setCargando(false);
        return;
      }
      const { data: perfilData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
      setPerfil(perfilData);

      if (perfilData?.rol === "admin") {
        const { data } = await supabase.from("profiles").select("*").eq("rol", "tecnico");
        setSolicitudes(data || []);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  async function aprobar(id) {
    await supabase.from("profiles").update({ tecnico_aprobado: true }).eq("id", id);
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, tecnico_aprobado: true } : s)));
  }

  async function revocar(id) {
    await supabase.from("profiles").update({ tecnico_aprobado: false }).eq("id", id);
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, tecnico_aprobado: false } : s)));
  }

  if (cargando) return <p className="text-muted">Cargando...</p>;

  if (perfil?.rol !== "admin") {
    return <p className="text-muted">No tenés acceso a esta página.</p>;
  }

  return (
    <div>
      <h1>Solicitudes de cuenta técnica</h1>
      <p className="text-muted">
        Nota: para que tu propio usuario sea admin, entrá a Supabase → tabla "profiles" → tu fila → cambiá
        "rol" a "admin" manualmente.
      </p>

      <div className="card" style={{ marginTop: 20 }}>
        {solicitudes.length === 0 && <p className="text-muted" style={{ padding: 20 }}>No hay solicitudes.</p>}
        {solicitudes.map((s) => (
          <div key={s.id} className="fila">
            <span>{s.nombre || "(sin nombre)"}</span>
            <span className="badge">{s.tecnico_aprobado ? "aprobado" : "pendiente"}</span>
            {s.tecnico_aprobado ? (
              <button className="btn btn-outline" onClick={() => revocar(s.id)}>Revocar</button>
            ) : (
              <button className="btn btn-primary" onClick={() => aprobar(s.id)}>Aprobar</button>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .fila {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
        }
        .fila:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
