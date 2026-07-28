import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data: destacados } = await supabase
    .from("productos")
    .select("*")
    .eq("destacado", true)
    .limit(8);

  return (
    <div>
      <section className="hero card">
        <div>
          <span className="badge badge-oferta">Mayorista y minorista</span>
          <h1>Repuestos y accesorios para celulares</h1>
          <p className="text-muted">
            Envíos a todo el país. Si sos técnico, registrate para ver precios
            mayoristas en módulos y repuestos.
          </p>
          <div className="hero-actions">
            <Link href="/productos" className="btn btn-primary">Ver catálogo</Link>
            <Link href="/registro" className="btn btn-outline">Registrarme como técnico</Link>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2>Destacados</h2>
        <div className="grid-productos">
          {(destacados || []).map((p) => (
            <ProductCard key={p.id} producto={p} perfil={null} />
          ))}
          {(!destacados || destacados.length === 0) && (
            <p className="text-muted">
              Todavía no cargaste productos destacados. Hacelo desde Supabase → tabla "productos".
            </p>
          )}
        </div>
      </section>

      <style>{`
        .hero {
          padding: 48px 32px;
          margin-top: 12px;
        }
        .hero h1 {
          font-size: 2.2rem;
          max-width: 640px;
          margin: 12px 0;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
