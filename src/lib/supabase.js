import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (import.meta.env.DEV && (!url || !key)) {
  console.info('[StateChange] Supabase not configured — community features use local state only')
}

// Client is null-safe — all callers must guard with `if (supabase)`
export const supabase = (url && key) ? createClient(url, key) : null
