-- Auth profile bootstrap, timestamp maintenance, and guarded workspace procedures.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (
    id, first_name, last_name, display_name, email, preferred_language, is_active
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    trim(concat_ws(' ', new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name')),
    coalesce(new.email, ''),
    case when new.raw_user_meta_data ->> 'preferred_language' in ('en', 'ar')
      then new.raw_user_meta_data ->> 'preferred_language'
      else 'en'
    end,
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_workspace_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id
  from public.workspace_memberships
  where user_id = auth.uid()
    and status = 'active';
$$;

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_memberships
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.workspace_role_for_user(p_workspace_id uuid, p_user_id uuid default auth.uid())
returns public.workspace_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.workspace_memberships
  where workspace_id = p_workspace_id
    and user_id = p_user_id
    and status = 'active'
  limit 1;
$$;

create or replace function public.has_workspace_role(p_workspace_id uuid, p_roles public.workspace_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.workspace_role_for_user(p_workspace_id) = any(p_roles);
$$;

create or replace function public.can_access_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = p_company_id
      and (
        public.is_workspace_member(c.workspace_id)
        or exists (
          select 1
          from public.company_contacts cc
          join public.contacts ct on ct.id = cc.contact_id
          where cc.company_id = c.id
            and ct.auth_user_id = auth.uid()
        )
        or exists (
          select 1
          from public.company_user_assignments cua
          where cua.company_id = c.id
            and cua.user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_manage_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = p_company_id
      and public.has_workspace_role(
        c.workspace_id,
        array['workspace_owner','agent','office_manager','pro']::public.workspace_role[]
      )
  );
$$;

create or replace function public.can_access_document(p_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.documents d
    where d.id = p_document_id
      and (
        public.is_workspace_member(d.workspace_id)
        or exists (
          select 1 from public.document_access_grants dag
          where dag.document_id = d.id
            and dag.user_id = auth.uid()
            and (dag.expires_at is null or dag.expires_at > now())
        )
      )
  );
$$;

create or replace function public.can_manage_workspace_members(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_workspace_role(
    p_workspace_id,
    array['workspace_owner','office_manager']::public.workspace_role[]
  );
$$;

create or replace function public.create_workspace_for_current_user(
  p_name_en text,
  p_name_ar text default '',
  p_workspace_type text default 'local_service_agent',
  p_subscription_plan public.workspace_plan default 'Starter'
)
returns public.workspaces
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace public.workspaces;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Profile is not ready yet. Please sign in again.';
  end if;

  insert into public.workspaces (name_en, name_ar, workspace_type, subscription_plan, created_by)
  values (trim(p_name_en), trim(coalesce(p_name_ar, '')), coalesce(p_workspace_type, 'local_service_agent'), p_subscription_plan, auth.uid())
  returning * into v_workspace;

  insert into public.workspace_memberships (workspace_id, user_id, role, status)
  values (v_workspace.id, auth.uid(), 'workspace_owner', 'active');

  return v_workspace;
end;
$$;

create or replace function public.create_workspace_invitation(
  p_workspace_id uuid,
  p_email text,
  p_role public.workspace_role,
  p_permissions jsonb default '[]'::jsonb
)
returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
  v_id uuid;
  v_expires_at timestamptz;
begin
  if auth.uid() is null or not public.can_manage_workspace_members(p_workspace_id) then
    raise exception 'You are not authorised to invite users to this workspace';
  end if;

  if lower(trim(p_email)) = '' then
    raise exception 'Email is required';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');

  insert into public.workspace_invitations (
    workspace_id, email, role, permissions, token_hash, invited_by, expires_at
  ) values (
    p_workspace_id, lower(trim(p_email)), p_role, coalesce(p_permissions, '[]'::jsonb),
    encode(digest(v_token, 'sha256'), 'hex'), auth.uid(), now() + interval '7 days'
  )
  returning id, workspace_invitations.expires_at into v_id, v_expires_at;

  return query select v_id, v_token, v_expires_at;
end;
$$;

create or replace function public.accept_workspace_invitation(p_token text)
returns public.workspace_memberships
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_invitation public.workspace_invitations;
  v_membership public.workspace_memberships;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  select lower(email) into v_email from public.profiles where id = auth.uid();

  select * into v_invitation
  from public.workspace_invitations
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and accepted_at is null
    and revoked_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Invitation is invalid, expired, revoked, or already used';
  end if;

  if lower(v_invitation.email) <> lower(v_email) then
    raise exception 'This invitation belongs to a different email address';
  end if;

  insert into public.workspace_memberships (workspace_id, user_id, role, permissions, status)
  values (v_invitation.workspace_id, auth.uid(), v_invitation.role, v_invitation.permissions, 'active')
  on conflict (workspace_id, user_id) do update set
    role = excluded.role,
    permissions = excluded.permissions,
    status = 'active',
    updated_at = now()
  returning * into v_membership;

  update public.workspace_invitations
  set accepted_at = now(), accepted_by = auth.uid()
  where id = v_invitation.id;

  return v_membership;
end;
$$;

-- Timestamp triggers
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger memberships_updated_at before update on public.workspace_memberships for each row execute function public.set_updated_at();
create trigger companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger relationships_updated_at before update on public.company_relationships for each row execute function public.set_updated_at();
create trigger contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();
create trigger documents_updated_at before update on public.documents for each row execute function public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger offboarding_cases_updated_at before update on public.offboarding_cases for each row execute function public.set_updated_at();
create trigger offboarding_checklist_updated_at before update on public.offboarding_checklist_items for each row execute function public.set_updated_at();
