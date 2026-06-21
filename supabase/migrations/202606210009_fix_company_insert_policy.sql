begin;

create or replace function public.can_create_company_in_workspace(
p_workspace_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
select exists (
select 1
from public.workspace_memberships wm
where wm.workspace_id = p_workspace_id
and wm.user_id = auth.uid()
and wm.status = 'active'
and wm.role = any (
array[
'workspace_owner',
'agent',
'office_manager',
'pro'
]::public.workspace_role[]
)
);
$$;

revoke all on function public.can_create_company_in_workspace(uuid) from public;

grant execute on function public.can_create_company_in_workspace(uuid)
to authenticated;

drop policy if exists "companies_insert_workspace_staff" on public.companies;

create policy "companies_insert_workspace_staff"
on public.companies
for insert
to authenticated
with check (
public.can_create_company_in_workspace(workspace_id)
);

commit;
