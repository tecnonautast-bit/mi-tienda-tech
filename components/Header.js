"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const supabase = createSupabaseBrowserClient();
  const { cantidadTotal } = useCart();
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUsuario(data?.user || null);
      if (data?.user) {
        const { data: perfilData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        setPerfil(perfilData);
      }
    });
  }, []);

  return (
    <header className="header">
      <div className="header-top">
        <Link href="/" className="logo">
          MI TIENDA <span>TECH</span>
        </Link>

        <nav className="nav-links">
          <Link href="/productos">Tienda</Link>
          <Link href="/productos?oferta=true">Ofertas</Link>
          <Link href="/productos?nuevo=true">Nuevos</Link>
          {perfil?.rol === "tecnico" && perfil?.tecnico_aprobado && (
            <Link href="/productos?categoria=modulos">Módulos (precio técnico)</Link>
          )}
        </nav>

        <div className="header-actions">
          {usuario ? (
            <Link href="/mi-cuenta" className="btn btn-outline">
              {perfil?.nombre || "Mi cuenta"}
              {perfil?.rol === "tecnico" && !perfil?.tecnico_aprobado && (
                <span className="badge" style={{ marginLeft: 6 }}>pendiente</span>
              )}
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                Ingresar
              </Link>
              <Link href="/registro" className="btn btn-outline">
                Soy técnico
              </Link>
            </>
          )}
          <Link href="/carrito" className="btn btn-primary">
            Carrito ({cantidadTotal})
          </Link>
        </div>
      </div>

      <style jsx>{`
        .header {
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .header-top {
          max-width: 1240px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .logo {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.3rem;
          letter-spacing: -0.02em;
        }
        .logo span {
          color: var(--accent);
        }
        .nav-links {
          display: flex;
          gap: 20px;
          flex: 1;
          font-size: 0.92rem;
        }
        .nav-links a:hover {
          color: var(--accent);
        }
        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        @media (max-width: 720px) {
          .nav-links {
            order: 3;
            width: 100%;
            gap: 14px;
            overflow-x: auto;
          }
        }
      `}</style>
    </header>
  );
}
