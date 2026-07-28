"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatearPrecio } from "@/lib/precios";

export default function MiCuentaPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [perfil, setPerfil] = useState(null);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/login");
        return;
      }
      const { data: perfilData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
      setPerfil(perfilData);

      const { data: pedidosData } = await supabase
        .from("pedidos")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      setPedidos(pedidosData || []);
    }
    cargar();
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!perfil) return <p className="text-muted">Cargando...</p>;

  return (
    <div>
      <h1>Hola, {perfil.nombre || "usuario"}</h1>

      {perfil.rol === "tecnico" && (
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          {perfil.tecnico_aprobado ? (
            <p>✅ Tu cuenta técnica está <strong>aprobada</strong>. Ya podés ver precios mayoristas.</p>
          ) : (
            <p>⏳ Tu solicitud de cuenta técnica está <strong>pendiente de aprobación</strong>.</p>
          )}
        </div>
      )}

      <h2>Mis pedidos</h2>
      {pedidos.length === 0 ? (
        <p className="text-muted">Todavía no hiciste ningún pedido.</p>
      ) : (
        <div className="card">
          {pedidos.map((p) => (
            <div key={p.id} className="fila-pedido">
              <span>#{p.id.slice(0, 8)}</span>
              <span>{new Date(p.created_at).toLocaleDateString("es-AR")}</span>
              <span className="badge">{p.metodo_pago}</span>
              <span className="badge">{p.estado}</span>
              <span className="precio">{formatearPrecio(p.total)}</span>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={cerrarSesion}>
        Cerrar sesión
      </button>

      <style jsx>{`
        .fila-pedido {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .fila-pedido:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
