-- Fictional development data only. This seed does not create auth users or memberships.
-- It is intentionally inaccessible to production accounts until you create a matching controlled demo membership.

insert into public.workspaces (id, name_en, name_ar, workspace_type, subscription_plan)
values ('11111111-1111-1111-1111-111111111111', 'Al Noor Local Services', 'النور للخدمات المحلية', 'local_service_agent', 'Professional')
on conflict (id) do nothing;

insert into public.companies (
  id, workspace_id, legal_name_en, legal_name_ar, trade_licence_number, emirate,
  legal_form, business_activity, registration_date, licence_issue_date, licence_expiry_date,
  company_status, annual_fee, fee_currency, relationship_type, manual_risk_flag
)
select
  ('00000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Demo Company ' || gs,
  'شركة تجريبية ' || gs,
  'DEMO-' || lpad(gs::text, 5, '0'),
  (array['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah'])[((gs - 1) % 5) + 1],
  (array['Sole Establishment','Civil Company','LLC','Branch'])[((gs - 1) % 4) + 1],
  'Professional services',
  current_date - (gs * 30),
  current_date - (gs * 20),
  current_date + ((gs % 9) * 15) - 60,
  case when gs % 11 = 0 then 'Offboarding'::public.company_status else 'Active'::public.company_status end,
  3500 + (gs * 250), 'AED', 'Local Service Agent', gs % 13 = 0
from generate_series(1, 25) as gs
on conflict (id) do nothing;

insert into public.contacts (
  id, workspace_id, full_name, full_name_ar, email, phone, nationality,
  preferred_language, relationship_status, last_contact_date
)
select
  ('10000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Demo Investor ' || gs,
  'مستثمر تجريبي ' || gs,
  'investor' || gs || '@example.test',
  '+97150000' || lpad(gs::text, 4, '0'),
  (array['UAE','Sudan','India','Egypt','United Kingdom'])[((gs - 1) % 5) + 1],
  case when gs % 2 = 0 then 'ar' else 'en' end,
  case when gs % 10 = 0 then 'Not Responding'::public.contact_relationship_status else 'Responsive'::public.contact_relationship_status end,
  current_date - (gs % 20)
from generate_series(1, 40) as gs
on conflict (id) do nothing;

insert into public.company_contacts (company_id, contact_id, role, is_primary)
select
  ('00000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  ('10000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  'Investor', true
from generate_series(1, 25) as gs
on conflict do nothing;

insert into public.tasks (workspace_id, company_id, title, priority, status, due_date)
select
  '11111111-1111-1111-1111-111111111111'::uuid,
  ('00000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  'Review renewal documents for Demo Company ' || gs,
  case when gs % 6 = 0 then 'High'::public.task_priority else 'Normal'::public.task_priority end,
  case when gs % 5 = 0 then 'Waiting for Client'::public.task_status else 'To Do'::public.task_status end,
  current_date + (gs % 10) - 5
from generate_series(1, 25) as gs;

-- Calculate initial transparent risk scores for all seeded companies.
select public.recalculate_company_risk(id)
from public.companies
where workspace_id = '11111111-1111-1111-1111-111111111111'::uuid;
