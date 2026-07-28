import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

export async function POST(request) {
  try {
    const { items, pedidoId } = await request.json();

    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        items: items.map((i) => ({
          title: i.nombre,
          quantity: i.cantidad,
          unit_price: Number(i.precio),
          currency_id: "ARS",
        })),
        external_reference: String(pedidoId), // así sabemos a qué pedido corresponde el pago
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/gracias?pedido=${pedidoId}&metodo=mercadopago`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
      },
    });

    return NextResponse.json({ init_point: resultado.init_point });
  } catch (err) {
    console.error("Error creando preferencia de Mercado Pago:", err);
    return NextResponse.json({ error: "No se pudo crear la preferencia" }, { status: 500 });
  }
}
