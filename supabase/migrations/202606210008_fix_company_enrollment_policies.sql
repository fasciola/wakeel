begin;

drop policy if exists "companies_insert_workspace_staff" on public.companies;
create policy "companies_insert_workspace_staff"
on public.companies
for insert
to authenticated
with check (
exists (
select 1
from public.workspace_memberships wm
where wm.workspace_id = workspace_id
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
)
);

drop policy if exists "contacts_write_staff" on public.contacts;
create policy "contacts_write_staff"
on public.contacts
for all
to authenticated
using (
exists (
select 1
from public.workspace_memberships wm
where wm.workspace_id = workspace_id
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
)
)
with check (
exists (
select 1
from public.workspace_memberships wm
where wm.workspace_id = workspace_id
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
)
);

drop policy if exists "company_contacts_write_staff" on public.company_contacts;
create policy "company_contacts_write_staff"
on public.company_contacts
for all
to authenticated
using (
exists (
select 1
from public.companies c
join public.workspace_memberships wm
on wm.workspace_id = c.workspace_id
where c.id = company_id
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
)
)
with check (
exists (
select 1
from public.companies c
join public.workspace_memberships wm
on wm.workspace_id = c.workspace_id
where c.id = company_id
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
)
);

commit;
