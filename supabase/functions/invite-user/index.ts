import { createUserClient, requireUser } from '../_shared/auth.ts';
import { json, optionsResponse } from '../_shared/http.ts';

const validRoles = new Set(['agent', 'office_manager', 'pro', 'investor', 'external_adviser']);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    await requireUser(request);
    const payload = await request.json();
    const workspaceId = typeof payload.workspaceId === 'string' ? payload.workspaceId : '';
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const role = validRoles.has(payload.role) ? payload.role : '';
    const permissions = Array.isArray(payload.permissions) ? payload.permissions : [];

    if (!workspaceId || !/^\S+@\S+\.\S+$/.test(email) || !role) {
      return json({ error: 'workspaceId, a valid email, and an allowed role are required' }, 400);
    }

    const supabase = createUserClient(request);
    const { data, error } = await supabase.rpc('create_workspace_invitation', {
      p_workspace_id: workspaceId,
      p_email: email,
      p_role: role,
      p_permissions: permissions,
    });

    if (error) return json({ error: error.message }, 403);

    const invitation = Array.isArray(data) ? data[0] : data;
    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:3000';
    const inviteUrl = `${appUrl.replace(/\/$/, '')}/?invite=${encodeURIComponent(invitation.invitation_token)}`;

    return json({
      invitationId: invitation.invitation_id,
      expiresAt: invitation.expires_at,
      inviteUrl,
      note: 'Email delivery is intentionally not configured. Send the generated secure invitation link through an approved channel.',
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 401);
  }
});
