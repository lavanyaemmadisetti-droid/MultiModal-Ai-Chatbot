import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let clientInstance = null;

/**
 * Check if Supabase client configuration is present in frontend environment
 * @returns {boolean}
 */
export const isSupabaseFrontendConfigured = () => {
  const placeholders = ['https://your-project.supabase.co', 'your-anon-key', ''];
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !placeholders.includes(supabaseUrl) &&
    !placeholders.includes(supabaseAnonKey) &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

/**
 * Get or initialize Supabase browser client
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const getSupabase = () => {
  if (!isSupabaseFrontendConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return clientInstance;
};

/**
 * Subscribe to real-time changes on documents
 * @param {function} onInsert
 * @returns {(() => void) | null}
 */
export const subscribeToDocuments = (onInsert) => {
  const client = getSupabase();
  if (!client) return null;

  const channel = client
    .channel('public:documents')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'documents' }, (payload) => {
      if (typeof onInsert === 'function') {
        onInsert(payload.new);
      }
    })
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};

/**
 * Sign in user with email & password
 */
export const signInWithEmail = async (email, password) => {
  const client = getSupabase();
  if (!client) throw new Error('Supabase client is not configured.');
  return await client.auth.signInWithPassword({ email, password });
};

/**
 * Sign up user with email & password
 */
export const signUpWithEmail = async (email, password) => {
  const client = getSupabase();
  if (!client) throw new Error('Supabase client is not configured.');
  return await client.auth.signUp({ email, password });
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  const client = getSupabase();
  if (!client) return;
  return await client.auth.signOut();
};

/**
 * Get current session user
 */
export const getCurrentUser = async () => {
  const client = getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data?.user || null;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  const client = getSupabase();
  if (!client) return () => {};
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
  return () => subscription?.unsubscribe();
};

export default {
  isSupabaseFrontendConfigured,
  getSupabase,
  subscribeToDocuments,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
  onAuthStateChange
};
