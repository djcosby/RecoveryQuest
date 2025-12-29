import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  try {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {}

  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_KEY');

// Determine if Supabase is actually configured with valid keys
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseKey && 
  supabaseUrl !== 'https://muoszdtpwkkrmqqlbsky.supabase.co' && 
  supabaseKey !== 'sb_publishable_i8Bc-731MUxU8UO9dMEJlA_KDs6MJDv';

if (!isSupabaseConfigured) {
  console.info('RecoveryQuest: Supabase not configured. Operating in Local-First mode (localStorage).');
}

// Initialize client with placeholders if necessary to prevent crashing
export const supabase = createClient(
  supabaseUrl || 'https://muoszdtpwkkrmqqlbsky.supabase.co', 
  supabaseKey || 'sb_publishable_i8Bc-731MUxU8UO9dMEJlA_KDs6MJDv'
);