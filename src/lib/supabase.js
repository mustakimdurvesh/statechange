import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://czqsipfjtkxmbtutkwcn.supabase.co'
const supabaseKey = 'sb_publishable_Sg4xsK8EI7r-CSxaQSGogA_LgKj0JfB'

export const supabase = createClient(supabaseUrl, supabaseKey)
