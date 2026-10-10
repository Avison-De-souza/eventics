import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key from your Supabase Project Settings
const SUPABASE_URL = 'https://snbhaaywbqpvlpsriscd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7E4fjemw-MUOZVtEW7h9fg_6SwnPBhX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);