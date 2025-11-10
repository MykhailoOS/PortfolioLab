import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Note: These are public keys and safe to expose in client-side code
const supabaseUrl = 'https://aidubaycwyuibtmdmsnr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZHViYXljd3l1aWJ0bWRtc25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjEwMTQsImV4cCI6MjA3ODAzNzAxNH0.i1jZCa_NZg1sYcvz9iW5HlcueY0EXSD9grhAOHELnFU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
