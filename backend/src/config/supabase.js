import './env.js';
import { createClient } from '@supabase/supabase-js';

const getUrl = () => (process.env.SUPABASE_URL || '').trim();
const getKey = () => (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
const getBucket = () => (process.env.SUPABASE_BUCKET || 'study-materials').trim();

let clientInstance = null;

/**
 * Check if valid Supabase credentials are configured
 * @returns {boolean}
 */
export const isSupabaseConfigured = () => {
  const url = getUrl();
  const key = getKey();
  const placeholders = ['https://your-project.supabase.co', 'your-anon-key', 'your-service-role-key', ''];
  return Boolean(
    url &&
    key &&
    !placeholders.includes(url) &&
    !placeholders.includes(key) &&
    url.startsWith('https://') &&
    key.length > 20
  );
};

/**
 * Get the Supabase client instance (or null if not configured)
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    const url = getUrl();
    const key = getKey();
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: false
      }
    });
  }

  return clientInstance;
};

export const getSupabaseBucketName = () => getBucket();

export default {
  isSupabaseConfigured,
  getSupabaseClient,
  getSupabaseBucketName
};
