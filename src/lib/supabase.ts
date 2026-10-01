import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

let client: SupabaseClient<Database> | null | undefined;

/**
 * Server-side Data API client, authenticated with the publishable key.
 * Requests run as the anon role, so row level security decides what they
 * may do: insert form submissions without reading them back, and read
 * market data. Returns null when the project is not configured, so the
 * site still builds and runs without a database.
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (client === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    client =
      url && key
        ? createClient<Database>(url, key, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          })
        : null;
  }
  return client;
}
