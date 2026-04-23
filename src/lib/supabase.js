// Supabase JS client — kept for Phase 4 Auth.
// Analytics and community reports use raw REST fetch directly
// to avoid PostgREST schema cache issues on new tables.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://czqsipfjtkxmbtutkwcn.supabase.co'
const supabaseKey = 'sb_publishable_Sg4xsK8EI7r-CSxaQSGogA_LgKj0JfB'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
