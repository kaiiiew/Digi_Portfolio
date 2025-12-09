// Minimal supabase client using @supabase/supabase-js (ES module)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctqvjgxjeomvvkwwflqf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)