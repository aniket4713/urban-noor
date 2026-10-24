import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Server-only Supabase client (service role key — never expose to the browser). */
export function supabaseAdmin() {
  if (!supabaseConfigured()) throw new Error("Supabase Storage is not configured");
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export const BUCKET = () => process.env.SUPABASE_BUCKET || "product-images";
