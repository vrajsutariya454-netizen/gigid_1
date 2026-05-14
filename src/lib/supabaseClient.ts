import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging for development
if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase Config Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  } else {
    console.log('✅ Supabase Client initialized successfully')
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    global: {
      fetch: (...args) => {
        return fetch(...args).catch(err => {
          console.warn('Supabase fetch failed (likely due to mock credentials or network issue):', err.message);
          return new Response(JSON.stringify({ error: 'fetch_failed', message: err.message }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          });
        });
      }
    }
  }
)