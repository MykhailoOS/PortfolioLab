import { createClient } from '@supabase/supabase-js';

// Get environment variables with proper fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://aidubaycwyuibtmdmsnr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZHViYXljd3l1aWJ0bWRtc25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjEwMTQsImV4cCI6MjA3ODAzNzAxNH0.i1jZCa_NZg1sYcvz9iW5HlcueY0EXSD9grhAOHELnFU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
