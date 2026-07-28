"use client";

import { createClient } from "@supabase/supabase-js";

// Este cliente se usa en componentes que corren en el navegador
// (formularios de login, agregar al carrito, etc.)
export function createSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
