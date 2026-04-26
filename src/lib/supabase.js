// Supabase JS client — kept for Phase 4 Auth.
// Analytics and community reports use raw REST fetch directly
// to avoid PostgREST schema cache issues on new tables.
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://wijgarmlllvlqfzxgoee.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_BmuItK5AvBrdqJM9NOTqGA_Zh84U75U'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
