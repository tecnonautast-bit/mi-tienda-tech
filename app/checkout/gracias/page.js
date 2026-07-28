"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function GraciasPage() {
  return (
    <Suspense fallback={<p className="text-muted">Cargando...</p>}>
      <GraciasContenido />
    </Suspense>
  );
}

function GraciasContenido() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get("pedido");
  const metodo = searchParams.get("metodo");

  return (
    <div className="card" style={{ padding: 32, maxWidth: 560, margin: "0 auto" }}>
      <h1>¡Pedido recibido!</h1>
      <p className="text-muted">Número de pedido: <strong>{pedido}</strong></p>

      {metodo === "transferencia" && (
        <div style={{ marginTop: 20 }}>
          <h3>Datos para transferir</h3>
          <p>CBU: 0000000000000000000000</p>
          <p>Alias: MI.TIENDA.TECH</p>
          <p className="text-muted">
            Enviá el comprobante por WhatsApp mencionando el número de pedido para que confirmemos tu compra.
          </p>
        </div>
      )}

      {metodo === "efectivo" && (
        <div style={{ marginTop: 20 }}>
          <h3>Pago en el local</h3>
          <p className="text-muted">
            Te contactaremos para coordinar el retiro. Pagás en efectivo al recibir tu pedido.
          </p>
        </div>
      )}

      {metodo === "mercadopago" && (
        <p className="text-muted" style={{ marginTop: 20 }}>
          Estamos confirmando tu pago con Mercado Pago. Te avisaremos por email cuando esté acreditado.
        </p>
      )}
    </div>
  );
}
