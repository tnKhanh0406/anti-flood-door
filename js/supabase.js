import { createClient  } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://voipzekejcnypdavmcrf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXB6ZWtlamNueXBkYXZtY3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjQ0NDIsImV4cCI6MjA5ODgwMDQ0Mn0._QTjUywonXng1UHn4-x92EO1iUSTsuVwvpY8e11yum4'

export const supabase = createClient( supabaseUrl, supabaseKey )