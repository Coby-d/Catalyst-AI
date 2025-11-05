import { createClient } from '@supabase/supabase-js';

// Your web app's Supabase configuration
// IMPORTANT: Replace these placeholder values with your actual Supabase project URL and anon key.
// You can find this information in your Supabase project settings under "API".
const supabaseUrl = 'https://nrmuymkdnjogzjpjmiaq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybXV5bWtkbmpvZ3pqcGptaWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMDk2NTEsImV4cCI6MjA3Nzg4NTY1MX0.O6_qSLdtoWIDCTa-FkzJsTv-q0mbgaTLWn-hMkesA2E';

// Initialize Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);