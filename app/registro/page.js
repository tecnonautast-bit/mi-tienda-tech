"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [esTecnico, setEsTecnico] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError("");

    const { data, error: errorSignup } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

    if (errorSignup) {
      setError(errorSignup.message);
      setCargando(false);
      return;
    }

    // Si pidió ser técnico, actualizamos su perfil (queda pendiente de aprobación manual)
    if (esTecnico && data?.user) {
      await supabase
        .from("profiles")
        .update({ rol: "tecnico", tecnico_aprobado: false })
        .eq("id", data.user.id);
    }

    setExito(true);
    setCargando(false);
  }

  if (exito) {
    return (
      <div className="card container-form">
        <h1>¡Listo!</h1>
        <p className="text-muted">
          Revisá tu email para confirmar la cuenta.
          {esTecnico && " Como pediste acceso técnico, un administrador va a aprobar tu cuenta antes de que veas los precios mayoristas."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card container-form">
      <h1>Crear cuenta</h1>
      <input
        type="text"
        placeholder="Nombre"
        className="input-field"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
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
        minLength={6}
      />

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "6px 0 18px" }}>
        <input type="checkbox" checked={esTecnico} onChange={(e) => setEsTecnico(e.target.checked)} />
        <span className="text-muted">
          Soy técnico y quiero acceder a precios mayoristas en módulos (requiere aprobación).
        </span>
      </label>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <button className="btn btn-primary" style={{ width: "100%" }} disabled={cargando}>
        {cargando ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
