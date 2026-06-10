import "server-only";

import { createClient } from "@supabase/supabase-js";

// Cliente con service_role: omite RLS. Usar únicamente en server actions
// que ya verificaron el rol del usuario. Jamás importar desde código cliente.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
