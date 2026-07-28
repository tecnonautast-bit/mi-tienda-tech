"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { precioParaUsuario, formatearPrecio } from "@/lib/precios";

export default function ProductCard({ producto, perfil }) {
  const { agregarItem } = useCart();
  const { precio, tipo } = precioParaUsuario(producto, perfil);
  const sinStock = producto.stock <= 0;

  function handleAgregar() {
    agregarItem({ id: producto.id, nombre: producto.nombre, precio, imagen_url: producto.imagen_url }, 1);
  }

  return (
    <div className="card producto-card">
      <Link href={`/producto/${producto.slug}`}>
        <div className="imagen-wrap">
          {producto.imagen_url ? (
            <Image src={producto.imagen_url} alt={producto.nombre} fill style={{ objectFit: "cover" }} />
          ) : (
            <div className="imagen-placeholder">Sin imagen</div>
          )}
        </div>
      </Link>

      <div className="producto-body">
        <div className="badges">
          {producto.oferta && <span className="badge badge-oferta">Oferta</span>}
          {producto.nuevo && <span className="badge badge-nuevo">Nuevo</span>}
          {tipo === "mayorista" && <span className="badge badge-mayorista">Precio técnico</span>}
        </div>

        <Link href={`/producto/${producto.slug}`}>
          <h3 className="nombre">{producto.nombre}</h3>
        </Link>

        <div className="precio">{formatearPrecio(precio)}</div>

        <button
          className="btn btn-primary btn-agregar"
          onClick={handleAgregar}
          disabled={sinStock}
        >
          {sinStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>

      <style jsx>{`
        .producto-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .imagen-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: var(--surface-alt);
        }
        .imagen-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .producto-body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          min-height: 22px;
        }
        .nombre {
          font-size: 0.98rem;
          font-weight: 600;
          margin: 0;
        }
        .btn-agregar {
          width: 100%;
          margin-top: 6px;
        }
        .btn-agregar:disabled {
          background: var(--surface-alt);
          color: var(--text-muted);
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
