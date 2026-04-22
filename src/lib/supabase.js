import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wijgarmlllvlqfzxgoee.supabase.co'
const supabaseKey = 'sb_publishable_BmuItK5AvBrdqJM9NOTqGA_Zh84U75U'

export const supabase = createClient(supabaseUrl, supabaseKey)
