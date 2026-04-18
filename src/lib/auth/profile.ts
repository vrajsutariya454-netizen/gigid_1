import { supabase } from '../supabaseClient';

/**
 * Fetches the profile for the currently authenticated user.
 */
export async function getCurrentUserProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { data: null, error: authError || new Error('No authenticated user') };
  }

  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { data, error: profileError };
}
