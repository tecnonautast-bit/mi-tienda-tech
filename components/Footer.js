"use client";

export default function Footer() {  
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>Mi Tienda Tech</strong>
          <p className="text-muted">Repuestos y accesorios para celulares.</p>
        </div>
        <div>
          <p className="text-muted">© {new Date().getFullYear()} Mi Tienda Tech. Todos los derechos reservados.</p>
        </div>
      </div>
      <style jsx>{`
        .footer {
          border-top: 1px solid var(--border);
          margin-top: 60px;
          padding: 32px 20px;
        }
        .footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
      `}</style>
    </footer>
  );
}
