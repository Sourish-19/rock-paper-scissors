import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-placeholder-supabase-url.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
