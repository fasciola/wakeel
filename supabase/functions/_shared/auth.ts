import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBearerToken } from './http.ts';

export function createUserClient(request: Request) {
  const token = getBearerToken(request);
  if (!token) throw new Error('Missing bearer token');

  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

export function createAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function requireUser(request: Request) {
  const token = getBearerToken(request);
  if (!token) throw new Error('Missing bearer token');

  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error('Invalid or expired session');
  return data.user;
}
