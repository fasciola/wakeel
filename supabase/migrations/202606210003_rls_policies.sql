-- Row Level Security: workspace isolation is enforced in the database.

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.companies enable row level security;
alter table public.company_relationships enable row level security;
alter table public.contacts enable row level security;
alter table public.company_contacts enable row level security;
alter table public.company_user_assignments enable row level security;
alter table public.documents enable row level security;
alter table public.document_access_grants enable row level security;
alter table public.approval_requests enable row level security;
alter table public.approval_decisions enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.tasks enable row level security;
alter table public.offboarding_cases enable row level security;
alter table public.offboarding_checklist_items enable row level security;
alter table public.communications enable row level security;
alter table public.notifications enable row level security;
alter table public.risk_events enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_read_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "workspaces_read_members" on public.workspaces for select using (public.is_workspace_member(id));
-- Workspace creation is performed via create_workspace_for_current_user().

create policy "memberships_read_self_or_manager" on public.workspace_memberships for select using (
  user_id = auth.uid() or public.can_manage_workspace_members(workspace_id)
);
create policy "memberships_manage_owner" on public.workspace_memberships for update using (
  public.has_workspace_role(workspace_id, array['workspace_owner']::public.workspace_role[])
) with check (
  public.has_workspace_role(workspace_id, array['workspace_owner']::public.workspace_role[])
);

create policy "companies_read_authorised" on public.companies for select using (public.can_access_company(id));
create policy "companies_insert_workspace_staff" on public.companies for insert with check (
  public.has_workspace_role(workspace_id, array['workspace_owner','agent','office_manager','pro']::public.workspace_role[])
);
create policy "companies_update_workspace_staff" on public.companies for update using (
  public.can_manage_company(id)
) with check (
  public.can_manage_company(id)
);
create policy "companies_delete_owner" on public.companies for delete using (
  public.has_workspace_role(workspace_id, array['workspace_owner']::public.workspace_role[])
);

create policy "relationships_read_authorised" on public.company_relationships for select using (public.can_access_company(company_id));
create policy "relationships_write_staff" on public.company_relationships for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "contacts_read_workspace_or_self" on public.contacts for select using (
  public.is_workspace_member(workspace_id) or auth_user_id = auth.uid()
);
create policy "contacts_write_staff" on public.contacts for all using (
  public.has_workspace_role(workspace_id, array['workspace_owner','agent','office_manager','pro']::public.workspace_role[])
) with check (
  public.has_workspace_role(workspace_id, array['workspace_owner','agent','office_manager','pro']::public.workspace_role[])
);

create policy "company_contacts_read_authorised" on public.company_contacts for select using (public.can_access_company(company_id));
create policy "company_contacts_write_staff" on public.company_contacts for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "company_assignments_read_company" on public.company_user_assignments for select using (public.can_access_company(company_id) or user_id = auth.uid());
create policy "company_assignments_write_manager" on public.company_user_assignments for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "documents_read_authorised" on public.documents for select using (public.can_access_document(id));
create policy "documents_insert_authorised" on public.documents for insert with check (
  public.can_manage_company(company_id) or public.can_access_company(company_id)
);
create policy "documents_update_staff" on public.documents for update using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));
create policy "documents_delete_owner" on public.documents for delete using (
  public.has_workspace_role(workspace_id, array['workspace_owner']::public.workspace_role[])
);

create policy "document_grants_read_authorised" on public.document_access_grants for select using (
  user_id = auth.uid() or exists (
    select 1 from public.documents d where d.id = document_id and public.can_manage_company(d.company_id)
  )
);
create policy "document_grants_manage_staff" on public.document_access_grants for all using (
  exists (select 1 from public.documents d where d.id = document_id and public.can_manage_company(d.company_id))
) with check (
  exists (select 1 from public.documents d where d.id = document_id and public.can_manage_company(d.company_id))
);

create policy "approval_requests_read_authorised" on public.approval_requests for select using (public.can_access_company(company_id));
create policy "approval_requests_insert_staff" on public.approval_requests for insert with check (public.can_manage_company(company_id));
create policy "approval_requests_update_staff_or_assignee" on public.approval_requests for update using (
  public.can_manage_company(company_id) or assigned_to = auth.uid()
) with check (
  public.can_manage_company(company_id) or assigned_to = auth.uid()
);

create policy "approval_decisions_read_authorised" on public.approval_decisions for select using (
  exists (select 1 from public.approval_requests ar where ar.id = approval_request_id and public.can_access_company(ar.company_id))
);
create policy "approval_decisions_insert_approver" on public.approval_decisions for insert with check (
  approver_id = auth.uid() and exists (
    select 1 from public.approval_requests ar
    where ar.id = approval_request_id
      and (public.can_manage_company(ar.company_id) or ar.assigned_to = auth.uid())
  )
);

create policy "invoices_read_authorised" on public.invoices for select using (public.can_access_company(company_id));
create policy "invoices_insert_manager" on public.invoices for insert with check (
  public.has_workspace_role(workspace_id, array['workspace_owner','office_manager']::public.workspace_role[])
);
create policy "invoices_update_manager" on public.invoices for update using (
  public.has_workspace_role(workspace_id, array['workspace_owner','office_manager']::public.workspace_role[])
) with check (
  public.has_workspace_role(workspace_id, array['workspace_owner','office_manager']::public.workspace_role[])
);

create policy "invoice_items_read_authorised" on public.invoice_items for select using (
  exists (select 1 from public.invoices i where i.id = invoice_id and public.can_access_company(i.company_id))
);
create policy "invoice_items_manage_manager" on public.invoice_items for all using (
  exists (select 1 from public.invoices i where i.id = invoice_id and public.has_workspace_role(i.workspace_id, array['workspace_owner','office_manager']::public.workspace_role[]))
) with check (
  exists (select 1 from public.invoices i where i.id = invoice_id and public.has_workspace_role(i.workspace_id, array['workspace_owner','office_manager']::public.workspace_role[]))
);

create policy "payments_read_authorised" on public.payments for select using (
  exists (select 1 from public.invoices i where i.id = invoice_id and public.can_access_company(i.company_id))
);
create policy "payments_insert_authorised" on public.payments for insert with check (
  exists (select 1 from public.invoices i where i.id = invoice_id and public.can_access_company(i.company_id))
);
create policy "payments_update_manager" on public.payments for update using (
  exists (select 1 from public.invoices i where i.id = invoice_id and public.has_workspace_role(i.workspace_id, array['workspace_owner','office_manager']::public.workspace_role[]))
) with check (
  exists (select 1 from public.invoices i where i.id = invoice_id and public.has_workspace_role(i.workspace_id, array['workspace_owner','office_manager']::public.workspace_role[]))
);

create policy "tasks_read_authorised" on public.tasks for select using (public.can_access_company(company_id));
create policy "tasks_insert_staff" on public.tasks for insert with check (public.can_manage_company(company_id));
create policy "tasks_update_staff_or_assignee" on public.tasks for update using (
  public.can_manage_company(company_id) or assignee_id = auth.uid()
) with check (public.can_manage_company(company_id) or assignee_id = auth.uid());
create policy "tasks_delete_manager" on public.tasks for delete using (public.can_manage_company(company_id));

create policy "offboarding_read_authorised" on public.offboarding_cases for select using (public.can_access_company(company_id));
create policy "offboarding_write_staff" on public.offboarding_cases for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "checklist_read_authorised" on public.offboarding_checklist_items for select using (
  exists (select 1 from public.offboarding_cases oc where oc.id = offboarding_case_id and public.can_access_company(oc.company_id))
);
create policy "checklist_write_staff" on public.offboarding_checklist_items for all using (
  exists (select 1 from public.offboarding_cases oc where oc.id = offboarding_case_id and public.can_manage_company(oc.company_id))
) with check (
  exists (select 1 from public.offboarding_cases oc where oc.id = offboarding_case_id and public.can_manage_company(oc.company_id))
);

create policy "communications_read_authorised" on public.communications for select using (
  public.is_workspace_member(workspace_id) or (contact_id is not null and exists (select 1 from public.contacts c where c.id = contact_id and c.auth_user_id = auth.uid()))
);
create policy "communications_write_staff" on public.communications for insert with check (
  public.has_workspace_role(workspace_id, array['workspace_owner','agent','office_manager','pro']::public.workspace_role[])
);

create policy "notifications_read_own" on public.notifications for select using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "risk_events_read_workspace" on public.risk_events for select using (public.is_workspace_member(workspace_id));

create policy "invitations_read_manager" on public.workspace_invitations for select using (public.can_manage_workspace_members(workspace_id));
-- Invitations are created and accepted via SECURITY DEFINER RPC functions / Edge Functions only.

create policy "audit_logs_read_owner_manager" on public.audit_logs for select using (
  public.has_workspace_role(workspace_id, array['workspace_owner','office_manager']::public.workspace_role[])
);

-- Audit logs are append-only: no authenticated client policy permits INSERT, UPDATE, or DELETE.
revoke insert, update, delete on public.audit_logs from anon, authenticated;
