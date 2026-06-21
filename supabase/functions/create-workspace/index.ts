import { createUserClient, requireUser } from '../_shared/auth.ts';
import { json, optionsResponse } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    await requireUser(request);
    const payload = await request.json();
    const nameEn = typeof payload.nameEn === 'string' ? payload.nameEn.trim() : '';
    const nameAr = typeof payload.nameAr === 'string' ? payload.nameAr.trim() : '';
    const workspaceType = typeof payload.workspaceType === 'string' ? payload.workspaceType.trim() : 'local_service_agent';
    const plan = ['Starter', 'Professional', 'Business'].includes(payload.subscriptionPlan)
      ? payload.subscriptionPlan : 'Starter';

    if (nameEn.length < 2 || nameEn.length > 120) return json({ error: 'Workspace name must be 2–120 characters' }, 400);

    const supabase = createUserClient(request);
    const { data, error } = await supabase.rpc('create_workspace_for_current_user', {
      p_name_en: nameEn,
      p_name_ar: nameAr,
      p_workspace_type: workspaceType,
      p_subscription_plan: plan,
    });

    if (error) return json({ error: error.message }, 400);
    return json({ workspace: data });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 401);
  }
});
