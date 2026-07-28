"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatearPrecio } from "@/lib/precios";

export default function CarritoPage() {
  const { items, cambiarCantidad, quitarItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <h1>Tu carrito está vacío</h1>
        <Link href="/productos" className="btn btn-primary">Ver catálogo</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Tu carrito</h1>

      <div className="lista card">
        {items.map((item) => (
          <div className="fila" key={item.id}>
            <span className="nombre">{item.nombre}</span>
            <input
              type="number"
              min="1"
              value={item.cantidad}
              onChange={(e) => cambiarCantidad(item.id, Number(e.target.value))}
              className="input-field cantidad"
            />
            <span className="precio">{formatearPrecio(item.precio * item.cantidad)}</span>
            <button className="btn btn-outline" onClick={() => quitarItem(item.id)}>
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="resumen card">
        <span>Total</span>
        <span className="precio" style={{ fontSize: "1.4rem" }}>{formatearPrecio(total)}</span>
      </div>

      <Link href="/checkout" className="btn btn-primary" style={{ marginTop: 20 }}>
        Continuar con la compra
      </Link>

      <style jsx>{`
        .lista {
          padding: 8px 20px;
        }
        .fila {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }
        .fila:last-child {
          border-bottom: none;
        }
        .nombre {
          flex: 1;
        }
        .cantidad {
          width: 70px;
          margin-bottom: 0;
        }
        .resumen {
          margin-top: 20px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
