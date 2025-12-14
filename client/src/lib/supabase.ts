// server/src/lib/supabase.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// FIX: Use import.meta.env for client-side variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Export a single Supabase client instance
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);
