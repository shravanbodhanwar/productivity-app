import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if credentials are valid (not placeholder values)
const isValidUrl = (url?: string) => url && url.startsWith('http')
const hasValidCredentials = isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('your')

// Only create client if credentials exist and are valid
export const supabase = hasValidCredentials
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Browser client
export const createBrowserClient = () => {
  if (!hasValidCredentials) {
    console.warn('Supabase not configured. Using demo/offline mode.')
    return null
  }
  return createClient(supabaseUrl!, supabaseAnonKey!)
}

// Server client (with service role key for admin operations)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!hasValidCredentials || !serviceRoleKey || serviceRoleKey.includes('your')) {
    console.warn('Supabase server credentials not configured.')
    return null
  }
  return createClient(supabaseUrl!, serviceRoleKey, {
    auth: { persistSession: false }
  })
}
