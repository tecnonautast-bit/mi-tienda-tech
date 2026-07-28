"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    router.push("/mi-cuenta");
  }

  return (
    <form onSubmit={handleSubmit} className="card container-form">
      <h1>Ingresar</h1>
      <input
        type="email"
        placeholder="Email"
        className="input-field"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="input-field"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <button className="btn btn-primary" style={{ width: "100%" }} disabled={cargando}>
        {cargando ? "Ingresando..." : "Ingresar"}
      </button>
      <p className="text-muted" style={{ marginTop: 16 }}>
        ¿No tenés cuenta? <Link href="/registro" style={{ color: "var(--accent)" }}>Registrate</Link>
      </p>
    </form>
  );
}
