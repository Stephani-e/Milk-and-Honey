import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Use createBrowserClient instead of createClient
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)