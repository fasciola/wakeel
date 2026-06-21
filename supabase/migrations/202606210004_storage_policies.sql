-- Private document vault. All previews and downloads must be issued by the document-signed-url Edge Function.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wakeel-documents',
  'wakeel-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_upload_document_object(p_workspace_id uuid, p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = p_company_id
      and c.workspace_id = p_workspace_id
      and (public.can_manage_company(c.id) or public.can_access_company(c.id))
  );
$$;

create policy "wakeel_documents_upload_authorised"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'wakeel-documents'
  and array_length(storage.foldername(name), 1) >= 4
  and public.can_upload_document_object(
    (storage.foldername(name))[1]::uuid,
    (storage.foldername(name))[2]::uuid
  )
);

-- There is deliberately no direct SELECT policy for authenticated users. The audited Edge Function
-- uses the service-role key to create a short-lived signed URL only after permission checks.

create policy "wakeel_documents_delete_owner"
on storage.objects for delete to authenticated
using (
  bucket_id = 'wakeel-documents'
  and array_length(storage.foldername(name), 1) >= 2
  and public.has_workspace_role(
    (storage.foldername(name))[1]::uuid,
    array['workspace_owner']::public.workspace_role[]
  )
);
