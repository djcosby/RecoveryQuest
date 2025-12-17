
import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables
const getEnv = (key: string) => {
  // 1. Try process.env (common in many bundlers/environments)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }

  // 2. Try import.meta.env (Vite specific)
  try {
    // Use type assertion to avoid TS errors, but check existence at runtime
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {
    // Ignore errors
  }

  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY environment variables.');
}

// Ensure valid URL string to prevent createClient from throwing immediately if vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder'
);
