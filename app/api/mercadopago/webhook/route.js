import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

// Mercado Pago llama a esta URL automáticamente cuando cambia el estado de un pago.
// Configurala en: Developers -> Tus integraciones -> Webhooks, apuntando a
// https://tu-dominio.com/api/mercadopago/webhook
export async function POST(request) {
  try {
    const body = await request.json();
    const paymentId = body?.data?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true }); // notificación irrelevante, la ignoramos
    }

    const payment = new Payment(client);
    const pagoInfo = await payment.get({ id: paymentId });

    const pedidoId = pagoInfo.external_reference;
    const estadoMP = pagoInfo.status; // 'approved' | 'pending' | 'rejected' etc.

    const supabase = createSupabaseServerClient();

    let estadoPedido = "pendiente";
    if (estadoMP === "approved") estadoPedido = "pagado";
    if (estadoMP === "rejected") estadoPedido = "cancelado";

    await supabase
      .from("pedidos")
      .update({ estado: estadoPedido, mp_payment_id: String(paymentId) })
      .eq("id", pedidoId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en webhook de Mercado Pago:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
