-- Immutable audit logging. Sensitive values are redacted before persistence.

create or replace function public.redact_audit_jsonb(p_value jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_result jsonb := coalesce(p_value, '{}'::jsonb);
  v_key text;
begin
  if jsonb_typeof(v_result) <> 'object' then
    return v_result;
  end if;

  foreach v_key in array array[
    'password', 'password_hash', 'token', 'token_hash', 'access_token', 'refresh_token',
    'storage_path', 'file_path', 'sha256_hash', 'ref_number', 'phone', 'email',
    'ip_address', 'device_info', 'proof_document_id'
  ] loop
    if v_result ? v_key then
      v_result := jsonb_set(v_result, array[v_key], to_jsonb('[redacted]'::text), true);
    end if;
  end loop;

  return v_result;
end;
$$;

create or replace function public.workspace_id_for_audit_row(p_table_name text, p_row jsonb)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
begin
  if p_row is null then return null; end if;

  if p_row ? 'workspace_id' then
    return nullif(p_row ->> 'workspace_id', '')::uuid;
  end if;

  case p_table_name
    when 'company_contacts', 'company_user_assignments' then
      select workspace_id into v_workspace_id from public.companies where id = (p_row ->> 'company_id')::uuid;
    when 'document_access_grants' then
      select workspace_id into v_workspace_id from public.documents where id = (p_row ->> 'document_id')::uuid;
    when 'approval_decisions' then
      select workspace_id into v_workspace_id
      from public.approval_requests where id = (p_row ->> 'approval_request_id')::uuid;
    when 'invoice_items' then
      select workspace_id into v_workspace_id from public.invoices where id = (p_row ->> 'invoice_id')::uuid;
    when 'payments' then
      select workspace_id into v_workspace_id
      from public.invoices where id = (p_row ->> 'invoice_id')::uuid;
    when 'offboarding_checklist_items' then
      select workspace_id into v_workspace_id
      from public.offboarding_cases where id = (p_row ->> 'offboarding_case_id')::uuid;
  end case;

  return v_workspace_id;
end;
$$;

create or replace function public.audit_action_name(p_table_name text, p_operation text)
returns text
language plpgsql
immutable
as $$
begin
  return case p_table_name
    when 'companies' then case p_operation when 'INSERT' then 'COMPANY_CREATED' when 'UPDATE' then 'COMPANY_UPDATED' else 'COMPANY_ARCHIVED' end
    when 'documents' then case p_operation when 'INSERT' then 'DOCUMENT_METADATA_CREATED' when 'UPDATE' then 'DOCUMENT_METADATA_UPDATED' else 'DOCUMENT_METADATA_DELETED' end
    when 'approval_requests' then case p_operation when 'INSERT' then 'APPROVAL_REQUEST_CREATED' when 'UPDATE' then 'APPROVAL_REQUEST_UPDATED' else 'APPROVAL_REQUEST_DELETED' end
    when 'approval_decisions' then 'APPROVAL_DECISION_RECORDED'
    when 'invoices' then case p_operation when 'INSERT' then 'INVOICE_CREATED' when 'UPDATE' then 'INVOICE_UPDATED' else 'INVOICE_DELETED' end
    when 'payments' then case p_operation when 'INSERT' then 'PAYMENT_CREATED' when 'UPDATE' then 'PAYMENT_UPDATED' else 'PAYMENT_DELETED' end
    when 'tasks' then case p_operation when 'INSERT' then 'TASK_CREATED' when 'UPDATE' then 'TASK_UPDATED' else 'TASK_DELETED' end
    when 'offboarding_cases' then case p_operation when 'INSERT' then 'OFFBOARDING_CASE_OPENED' when 'UPDATE' then 'OFFBOARDING_CASE_UPDATED' else 'OFFBOARDING_CASE_DELETED' end
    when 'workspace_memberships' then case p_operation when 'INSERT' then 'MEMBER_ADDED' when 'UPDATE' then 'MEMBER_UPDATED' else 'MEMBER_REMOVED' end
    else upper(p_table_name) || '_' || p_operation
  end;
end;
$$;

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new jsonb;
  v_old jsonb;
  v_workspace_id uuid;
  v_actor_name text;
  v_entity_id uuid;
begin
  if tg_table_name = 'audit_logs' then
    return coalesce(new, old);
  end if;

  v_new := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end;
  v_old := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end;
  v_workspace_id := public.workspace_id_for_audit_row(tg_table_name, coalesce(v_new, v_old));

  if v_workspace_id is null then
    return coalesce(new, old);
  end if;

  select display_name into v_actor_name from public.profiles where id = auth.uid();
  v_entity_id := nullif(coalesce(v_new ->> 'id', v_old ->> 'id'), '')::uuid;

  insert into public.audit_logs (
    workspace_id, actor_user_id, actor_display_name, entity_type, entity_id,
    action, source, old_values, new_values, metadata
  ) values (
    v_workspace_id,
    auth.uid(),
    nullif(v_actor_name, ''),
    tg_table_name,
    v_entity_id,
    public.audit_action_name(tg_table_name, tg_op),
    'database',
    public.redact_audit_jsonb(v_old),
    public.redact_audit_jsonb(v_new),
    jsonb_build_object('operation', tg_op, 'schema', tg_table_schema)
  );

  return coalesce(new, old);
end;
$$;

-- The audit log table itself is append-only; all business-table changes are tracked here.
create trigger audit_companies after insert or update or delete on public.companies for each row execute function public.audit_row_change();
create trigger audit_company_relationships after insert or update or delete on public.company_relationships for each row execute function public.audit_row_change();
create trigger audit_contacts after insert or update or delete on public.contacts for each row execute function public.audit_row_change();
create trigger audit_company_contacts after insert or update or delete on public.company_contacts for each row execute function public.audit_row_change();
create trigger audit_documents after insert or update or delete on public.documents for each row execute function public.audit_row_change();
create trigger audit_approval_requests after insert or update or delete on public.approval_requests for each row execute function public.audit_row_change();
create trigger audit_approval_decisions after insert or update or delete on public.approval_decisions for each row execute function public.audit_row_change();
create trigger audit_invoices after insert or update or delete on public.invoices for each row execute function public.audit_row_change();
create trigger audit_invoice_items after insert or update or delete on public.invoice_items for each row execute function public.audit_row_change();
create trigger audit_payments after insert or update or delete on public.payments for each row execute function public.audit_row_change();
create trigger audit_tasks after insert or update or delete on public.tasks for each row execute function public.audit_row_change();
create trigger audit_offboarding_cases after insert or update or delete on public.offboarding_cases for each row execute function public.audit_row_change();
create trigger audit_offboarding_checklist_items after insert or update or delete on public.offboarding_checklist_items for each row execute function public.audit_row_change();
create trigger audit_communications after insert or update or delete on public.communications for each row execute function public.audit_row_change();
create trigger audit_workspace_memberships after insert or update or delete on public.workspace_memberships for each row execute function public.audit_row_change();

create or replace function public.log_sensitive_event(
  p_workspace_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_source text default 'edge_function',
  p_metadata jsonb default '{}'::jsonb,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_actor_name text;
begin
  if auth.uid() is not null and not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not authorised for this workspace';
  end if;

  select display_name into v_actor_name from public.profiles where id = auth.uid();

  insert into public.audit_logs (
    workspace_id, actor_user_id, actor_display_name, entity_type, entity_id,
    action, source, metadata, ip_address, user_agent
  ) values (
    p_workspace_id, auth.uid(), v_actor_name, p_entity_type, p_entity_id,
    p_action, p_source, public.redact_audit_jsonb(p_metadata), p_ip_address, p_user_agent
  ) returning id into v_id;

  return v_id;
end;
$$;
