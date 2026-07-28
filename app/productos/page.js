"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { categoriaVisiblePara } from "@/lib/precios";
import ProductCard from "@/components/ProductCard";

export default function ProductosPage() {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();

  const [perfil, setPerfil] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(searchParams.get("categoria") || "");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);

      const { data: userData } = await supabase.auth.getUser();
      let perfilData = null;
      if (userData?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
        perfilData = data;
      }
      setPerfil(perfilData);

      const { data: categoriasData } = await supabase.from("categorias").select("*").order("orden");
      setCategorias((categoriasData || []).filter((c) => categoriaVisiblePara(c, perfilData)));

      let query = supabase.from("productos").select("*");
      if (searchParams.get("oferta") === "true") query = query.eq("oferta", true);
      if (searchParams.get("nuevo") === "true") query = query.eq("nuevo", true);
      if (categoriaActiva) {
        const cat = (categoriasData || []).find((c) => c.slug === categoriaActiva);
        if (cat) query = query.eq("categoria_id", cat.id);
      }

      const { data: productosData } = await query;
      setProductos(productosData || []);
      setCargando(false);
    }
    cargar();
  }, [categoriaActiva, searchParams]);

  return (
    <div>
      <h1>Tienda</h1>

      <div className="filtros">
        <button
          className={`chip ${categoriaActiva === "" ? "activo" : ""}`}
          onClick={() => setCategoriaActiva("")}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            className={`chip ${categoriaActiva === c.slug ? "activo" : ""}`}
            onClick={() => setCategoriaActiva(c.slug)}
          >
            {c.nombre}
            {c.solo_tecnicos && " 🔧"}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="text-muted">Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p className="text-muted">No hay productos en esta categoría todavía.</p>
      ) : (
        <div className="grid-productos">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} perfil={perfil} />
          ))}
        </div>
      )}

      <style jsx>{`
        .filtros {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin: 16px 0 28px;
        }
        .chip {
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
        }
        .chip.activo {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
