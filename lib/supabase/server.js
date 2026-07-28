import { createClient } from "@supabase/supabase-js";

// Este cliente se usa en Server Components y API routes
// (leer productos en el servidor, crear pedidos, etc.)
export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
