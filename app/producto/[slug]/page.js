"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { precioParaUsuario, formatearPrecio } from "@/lib/precios";
import { useCart } from "@/lib/cart-context";

export default function ProductoPage() {
  const { slug } = useParams();
  const supabase = createSupabaseBrowserClient();
  const { agregarItem } = useCart();

  const [producto, setProducto] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
        setPerfil(data);
      }
      const { data: productoData } = await supabase.from("productos").select("*").eq("slug", slug).single();
      setProducto(productoData);
    }
    cargar();
  }, [slug]);

  if (!producto) return <p className="text-muted">Cargando...</p>;

  const { precio, tipo } = precioParaUsuario(producto, perfil);

  return (
    <div className="ficha">
      <div className="imagen-wrap card">
        {producto.imagen_url ? (
          <Image src={producto.imagen_url} alt={producto.nombre} fill style={{ objectFit: "cover" }} />
        ) : (
          <div className="text-muted" style={{ padding: 40 }}>Sin imagen</div>
        )}
      </div>

      <div>
        <h1>{producto.nombre}</h1>
        {tipo === "mayorista" && <span className="badge badge-mayorista">Precio técnico</span>}
        <div className="precio" style={{ fontSize: "1.6rem", margin: "12px 0" }}>
          {formatearPrecio(precio)}
        </div>
        <p className="text-muted">{producto.descripcion}</p>

        <div className="acciones">
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
            className="input-field cantidad"
          />
          <button
            className="btn btn-primary"
            disabled={producto.stock <= 0}
            onClick={() =>
              agregarItem(
                { id: producto.id, nombre: producto.nombre, precio, imagen_url: producto.imagen_url },
                cantidad
              )
            }
          >
            {producto.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
          </button>
        </div>

        {!perfil && producto.precio_mayorista && (
          <p className="text-muted" style={{ marginTop: 16 }}>
            ¿Sos técnico? <a href="/registro" style={{ color: "var(--accent)" }}>Registrate</a> para
            acceder a precios mayoristas en esta categoría.
          </p>
        )}
      </div>

      <style jsx>{`
        .ficha {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .imagen-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
        }
        .acciones {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .cantidad {
          width: 80px;
          margin-bottom: 0;
        }
        @media (max-width: 720px) {
          .ficha {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
