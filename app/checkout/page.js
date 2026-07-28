"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";
import { formatearPrecio } from "@/lib/precios";

export default function CheckoutPage() {
  const { items, total, vaciarCarrito } = useCart();
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [metodo, setMetodo] = useState("mercadopago");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  async function confirmarPedido() {
    setProcesando(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();

    // Guardamos el pedido en la base de datos, sea cual sea el método de pago
    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({
        user_id: userData?.user?.id || null,
        total,
        metodo_pago: metodo,
        estado: "pendiente",
      })
      .select()
      .single();

    if (errorPedido) {
      setError("Hubo un problema al crear el pedido. Probá de nuevo.");
      setProcesando(false);
      return;
    }

    const itemsPedido = items.map((i) => ({
      pedido_id: pedido.id,
      producto_id: i.id,
      cantidad: i.cantidad,
      precio_unitario: i.precio,
    }));
    await supabase.from("pedido_items").insert(itemsPedido);

    if (metodo === "mercadopago") {
      // Le pedimos a nuestra propia API que cree la preferencia de pago en Mercado Pago
      const res = await fetch("/api/mercadopago/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, pedidoId: pedido.id }),
      });
      const data = await res.json();

      if (data.init_point) {
        vaciarCarrito();
        window.location.href = data.init_point; // redirige a la pasarela de Mercado Pago
        return;
      }
      setError("No se pudo iniciar el pago con Mercado Pago.");
      setProcesando(false);
      return;
    }

    // Transferencia o efectivo: mostramos instrucciones y listo
    vaciarCarrito();
    router.push(`/checkout/gracias?pedido=${pedido.id}&metodo=${metodo}`);
  }

  return (
    <div className="checkout">
      <h1>Finalizar compra</h1>

      <div className="card resumen">
        <h3>Resumen</h3>
        {items.map((i) => (
          <div key={i.id} className="linea">
            <span>{i.cantidad}x {i.nombre}</span>
            <span>{formatearPrecio(i.precio * i.cantidad)}</span>
          </div>
        ))}
        <div className="linea total">
          <span>Total</span>
          <span className="precio">{formatearPrecio(total)}</span>
        </div>
      </div>

      <div className="card metodos">
        <h3>Forma de pago</h3>

        <label className="opcion">
          <input type="radio" checked={metodo === "mercadopago"} onChange={() => setMetodo("mercadopago")} />
          <div>
            <strong>Mercado Pago</strong>
            <p className="text-muted">Tarjeta, dinero en cuenta o QR. Pago inmediato.</p>
          </div>
        </label>

        <label className="opcion">
          <input type="radio" checked={metodo === "transferencia"} onChange={() => setMetodo("transferencia")} />
          <div>
            <strong>Transferencia bancaria</strong>
            <p className="text-muted">Te mostramos el CBU/alias al confirmar. El pedido queda reservado.</p>
          </div>
        </label>

        <label className="opcion">
          <input type="radio" checked={metodo === "efectivo"} onChange={() => setMetodo("efectivo")} />
          <div>
            <strong>Efectivo en el local</strong>
            <p className="text-muted">Pagás al retirar. Te avisamos cuando esté listo.</p>
          </div>
        </label>
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <button className="btn btn-primary" onClick={confirmarPedido} disabled={procesando}>
        {procesando ? "Procesando..." : "Confirmar pedido"}
      </button>

      <style jsx>{`
        .checkout {
          max-width: 560px;
        }
        .resumen,
        .metodos {
          padding: 20px;
          margin-bottom: 20px;
        }
        .linea {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
        }
        .total {
          border-top: 1px solid var(--border);
          margin-top: 10px;
          padding-top: 12px;
          font-weight: 700;
        }
        .opcion {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
        }
        .opcion:last-child {
          border-bottom: none;
        }
        .opcion input {
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
