-- Wakeel Aman core schema. Run through the Supabase CLI only.
create extension if not exists pgcrypto;

create type public.workspace_role as enum (
  'platform_super_admin', 'workspace_owner', 'agent', 'office_manager', 'pro', 'investor', 'external_adviser'
);
create type public.membership_status as enum ('active', 'suspended', 'pending');
create type public.workspace_plan as enum ('Starter', 'Professional', 'Business');
create type public.company_status as enum ('Active', 'Inactive', 'Under Review', 'Offboarding', 'Closed');
create type public.risk_level as enum ('Low', 'Moderate', 'High', 'Critical');
create type public.document_verification_status as enum ('Verified', 'Pending Review', 'Expired', 'Rejected');
create type public.approval_status as enum ('Draft', 'Submitted', 'Under Review', 'Needs More Information', 'Approved', 'Rejected', 'Cancelled', 'Expired');
create type public.approval_decision_type as enum ('Approve', 'Reject', 'Request Clarification', 'Request Revised Document', 'Approve with Conditions');
create type public.payment_status as enum ('Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled', 'Written Off');
create type public.payment_verification_status as enum ('Pending Verification', 'Approved', 'Rejected');
create type public.task_priority as enum ('Low', 'Normal', 'High', 'Urgent');
create type public.task_status as enum ('To Do', 'In Progress', 'Waiting for Client', 'Waiting for Agent', 'Completed', 'Cancelled');
create type public.offboarding_status as enum (
  'Case Opened', 'Investor Notified', 'Documents Requested', 'Company Records Reviewed',
  'Pending Items Identified', 'Transfer Preparation', 'Closure Preparation', 'Legal/PRO Review',
  'Awaiting External Completion', 'Completed', 'Closed Without Completion'
);
create type public.checklist_status as enum ('Pending', 'Completed', 'N/A');
create type public.contact_relationship_status as enum ('Active', 'Responsive', 'Delayed Response', 'Not Responding', 'Under Review', 'Offboarding', 'Closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  display_name text not null default '',
  email text not null,
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  avatar_path text,
  is_active boolean not null default true,
  two_factor_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name_en text not null check (char_length(trim(name_en)) between 2 and 120),
  name_ar text not null default '',
  workspace_type text not null default 'local_service_agent',
  logo_path text,
  timezone text not null default 'Asia/Dubai',
  subscription_plan public.workspace_plan not null default 'Starter',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null,
  permissions jsonb not null default '[]'::jsonb,
  status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legal_name_en text not null,
  legal_name_ar text not null default '',
  trade_licence_number text,
  emirate text not null,
  legal_form text not null,
  business_activity text not null default '',
  registration_date date,
  licence_issue_date date,
  licence_expiry_date date,
  company_status public.company_status not null default 'Active',
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  risk_level public.risk_level not null default 'Low',
  assigned_manager_id uuid references public.profiles(id) on delete set null,
  annual_fee numeric(12,2) not null default 0 check (annual_fee >= 0),
  fee_currency text not null default 'AED' check (char_length(fee_currency) between 3 and 3),
  relationship_type text not null default 'Local Service Agent',
  manual_risk_flag boolean not null default false,
  notes text,
  is_archived boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, trade_licence_number)
);

create table public.company_relationships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  agent_user_id uuid references public.profiles(id) on delete set null,
  relationship_type text not null,
  agreement_start_date date,
  agreement_end_date date,
  annual_fee numeric(12,2) not null default 0 check (annual_fee >= 0),
  fee_currency text not null default 'AED' check (char_length(fee_currency) = 3),
  agreement_status text not null default 'Active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  auth_user_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  full_name_ar text,
  email text,
  phone text,
  nationality text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  relationship_status public.contact_relationship_status not null default 'Active',
  ref_number text,
  notes text,
  last_contact_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  role text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique(company_id, contact_id, role)
);

create table public.company_user_assignments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assignment_type text not null default 'external_adviser',
  created_at timestamptz not null default now(),
  unique(company_id, user_id, assignment_type)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  document_type text not null,
  title text not null,
  storage_bucket text not null default 'wakeel-documents',
  storage_path text not null unique,
  original_file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null default 0 check (file_size_bytes >= 0),
  sha256_hash text,
  issue_date date,
  expiry_date date,
  verification_status public.document_verification_status not null default 'Pending Review',
  version_number integer not null default 1 check (version_number > 0),
  parent_document_id uuid references public.documents(id) on delete set null,
  replaced_by_document_id uuid references public.documents(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  notes text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_access_grants (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission text not null default 'read' check (permission in ('read', 'upload_replacement')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique(document_id, user_id, permission)
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  request_title text not null,
  request_category text not null,
  description_en text not null default '',
  description_ar text not null default '',
  requested_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date date,
  risk_level public.risk_level not null default 'Low',
  status public.approval_status not null default 'Draft',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.approval_decisions (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references public.approval_requests(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  approver_id uuid references public.profiles(id) on delete set null,
  decision public.approval_decision_type not null,
  comments text,
  authentication_method text not null default 'authenticated_session',
  ip_address inet,
  device_info text,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_number text not null,
  invoice_date date not null default current_date,
  due_date date,
  currency text not null default 'AED' check (char_length(currency) = 3),
  subtotal numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  payment_status public.payment_status not null default 'Draft',
  created_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, invoice_number)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  title text not null,
  description text,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null,
  payment_date date not null default current_date,
  proof_document_id uuid references public.documents(id) on delete set null,
  verification_status public.payment_verification_status not null default 'Pending Verification',
  verified_by uuid references public.profiles(id) on delete set null,
  verification_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  priority public.task_priority not null default 'Normal',
  status public.task_status not null default 'To Do',
  due_date date,
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.offboarding_cases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  reason text not null,
  status public.offboarding_status not null default 'Case Opened',
  risk_level public.risk_level not null default 'Low',
  assigned_to uuid references public.profiles(id) on delete set null,
  opened_at timestamptz not null default now(),
  target_date date,
  closed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.offboarding_checklist_items (
  id uuid primary key default gen_random_uuid(),
  offboarding_case_id uuid not null references public.offboarding_cases(id) on delete cascade,
  title text not null,
  description text,
  stage_number integer,
  status public.checklist_status not null default 'Pending',
  responsible_user_id uuid references public.profiles(id) on delete set null,
  due_date date,
  evidence_document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.communications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  channel text not null,
  subject text not null default '',
  content text not null default '',
  direction text not null check (direction in ('Incoming', 'Outgoing', 'Internal')),
  status text not null default 'Logged',
  sent_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  channel text not null default 'In-App' check (channel in ('In-App', 'Email', 'WhatsApp')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.risk_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  risk_rule_key text not null,
  score_change integer not null,
  explanation_en text not null,
  explanation_ar text not null,
  status text not null default 'Active' check (status in ('Active', 'Resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique(company_id, risk_rule_key)
);

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role public.workspace_role not null,
  permissions jsonb not null default '[]'::jsonb,
  token_hash text not null unique,
  invited_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_display_name text,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  source text not null default 'database',
  old_values jsonb,
  new_values jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  request_id uuid,
  created_at timestamptz not null default now()
);

create index companies_workspace_idx on public.companies(workspace_id);
create index companies_expiry_idx on public.companies(licence_expiry_date);
create index companies_risk_idx on public.companies(workspace_id, risk_level, risk_score desc);
create index company_relationships_company_idx on public.company_relationships(company_id);
create index contacts_workspace_idx on public.contacts(workspace_id);
create index documents_company_idx on public.documents(company_id, is_archived);
create index documents_workspace_idx on public.documents(workspace_id);
create index approval_requests_company_idx on public.approval_requests(company_id, status);
create index invoices_company_idx on public.invoices(company_id, payment_status);
create index tasks_company_idx on public.tasks(company_id, status, due_date);
create index offboarding_company_idx on public.offboarding_cases(company_id, status);
create index notifications_user_idx on public.notifications(user_id, is_read, created_at desc);
create index audit_logs_workspace_created_idx on public.audit_logs(workspace_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index invitations_workspace_idx on public.workspace_invitations(workspace_id, email);
