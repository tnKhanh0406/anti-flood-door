import { createClient  } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'xxxxx'
const supabaseKey = 'xxxxx'

export const supabase = createClient( supabaseUrl, supabaseKey )