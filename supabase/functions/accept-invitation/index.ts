import { createUserClient, requireUser } from '../_shared/auth.ts';
import { json, optionsResponse } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    await requireUser(request);
    const { token } = await request.json();
    if (typeof token !== 'string' || token.length < 32) return json({ error: 'A valid invitation token is required' }, 400);

    const supabase = createUserClient(request);
    const { data, error } = await supabase.rpc('accept_workspace_invitation', { p_token: token });
    if (error) return json({ error: error.message }, 400);

    return json({ membership: data });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 401);
  }
});
