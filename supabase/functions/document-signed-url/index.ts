import { createUserClient, createAdminClient, requireUser } from '../_shared/auth.ts';
import { corsHeaders, json, optionsResponse } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireUser(request);
    const { documentId } = await request.json();
    if (typeof documentId !== 'string' || documentId.length < 10) {
      return json({ error: 'A valid documentId is required' }, 400);
    }

    const userClient = createUserClient(request);
    const { data: document, error: documentError } = await userClient
      .from('documents')
      .select('id, workspace_id, company_id, storage_bucket, storage_path')
      .eq('id', documentId)
      .single();

    if (documentError || !document) return json({ error: 'Document not found or access denied' }, 404);

    const admin = createAdminClient();
    const { data: signed, error: signedError } = await admin.storage
      .from(document.storage_bucket)
      .createSignedUrl(document.storage_path, 300);

    if (signedError || !signed?.signedUrl) {
      console.error('Signed URL creation failed', signedError);
      return json({ error: 'Could not prepare document access' }, 500);
    }

    await admin.from('audit_logs').insert({
      workspace_id: document.workspace_id,
      actor_user_id: user.id,
      entity_type: 'documents',
      entity_id: document.id,
      action: 'DOCUMENT_SIGNED_URL_CREATED',
      source: 'edge_function',
      metadata: { expires_in_seconds: 300, company_id: document.company_id },
      user_agent: request.headers.get('user-agent'),
    });

    return new Response(JSON.stringify({ signedUrl: signed.signedUrl, expiresIn: 300 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 401);
  }
});
