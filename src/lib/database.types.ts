// Database entity types mirroring Supabase schemas and Row Level Security definitions

export interface DatabaseProfile {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  phone?: string;
  preferred_language: 'en' | 'ar';
  avatar_path?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWorkspace {
  id: string;
  name_en: string;
  name_ar: string;
  workspace_type: string;
  logo_path?: string;
  timezone: string;
  subscription_plan: 'Starter' | 'Professional' | 'Business';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'platform_super_admin' | 'workspace_owner' | 'agent' | 'office_manager' | 'pro' | 'investor' | 'external_adviser';
  permissions: string[]; // permissions array serialized/deserialized or JSON
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface DatabaseCompany {
  id: string;
  workspace_id: string;
  legal_name_en: string;
  legal_name_ar: string;
  trade_licence_number: string;
  emirate: 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Umm Al Quwain' | 'Ras Al Khaimah' | 'Fujairah';
  legal_form: string;
  business_activity: string;
  registration_date: string;
  licence_issue_date: string;
  licence_expiry_date: string;
  company_status: 'Active' | 'Inactive' | 'Under Review' | 'Offboarding' | 'Closed';
  risk_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  assigned_manager_id?: string;
  annual_fee: number;
  fee_currency: string;
  relationship_type: 'Local Service Agent' | 'Nominee Shareholder' | 'Local Partner' | 'Authorised Signatory' | 'Consultant' | 'PRO Representative' | 'Other';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCompanyRelationship {
  id: string;
  workspace_id: string;
  company_id: string;
  agent_user_id?: string;
  relationship_type: string;
  agreement_start_date?: string;
  agreement_end_date?: string;
  annual_fee: number;
  fee_currency: string;
  agreement_status: 'Active' | 'Expired' | 'Terminated' | 'Dispute';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseContact {
  id: string;
  workspace_id: string;
  full_name: string;
  full_name_ar?: string;
  email: string;
  phone: string;
  nationality: string;
  preferred_language: 'en' | 'ar';
  relationship_status: string;
  ref_number?: string;
  notes?: string;
  last_contact_date?: string;
  auth_user_id?: string;
}

export interface DatabaseCompanyContact {
  id: string;
  company_id: string;
  contact_id: string;
  role: string;
  is_primary: boolean;
}

export interface DatabaseDocument {
  id: string;
  workspace_id: string;
  company_id: string;
  document_type: string;
  title: string;
  storage_bucket: string;
  storage_path: string;
  original_file_name: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash?: string;
  issue_date?: string;
  expiry_date?: string;
  verification_status: 'Verified' | 'Pending Review' | 'Expired' | 'Rejected';
  version_number: number;
  parent_document_id?: string;
  replaced_by_document_id?: string;
  uploaded_by: string;
  notes?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseApprovalRequest {
  id: string;
  workspace_id: string;
  company_id: string;
  request_title: string;
  request_category: string;
  description_en: string;
  description_ar: string;
  requested_by: string;
  assigned_to?: string;
  due_date: string;
  risk_level: 'Low' | 'Medium' | 'High';
  status: string;
  created_at: string;
  completed_at?: string;
}

export interface DatabaseApprovalDecision {
  id: string;
  approval_request_id: string;
  document_id?: string;
  approver_id: string;
  decision: 'Approve' | 'Reject' | 'Request Clarification' | 'Request Revised Document' | 'Approve with Conditions';
  comments?: string;
  authentication_method: string;
  ip_address?: string;
  device_info?: string;
  created_at: string;
}

export interface DatabaseInvoice {
  id: string;
  workspace_id: string;
  company_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  vat_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: string;
  created_by: string;
  notes?: string;
}

export interface DatabaseInvoiceItem {
  id: string;
  invoice_id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface DatabasePayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_reference?: string;
  proof_document_id?: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  verified_by?: string;
  verification_notes?: string;
  created_at: string;
}

export interface DatabaseTask {
  id: string;
  workspace_id: string;
  company_id: string;
  title: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Completed';
  due_date: string;
  assignee_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOffboardingCase {
  id: string;
  workspace_id: string;
  company_id: string;
  title: string;
  reason: string;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  assigned_to?: string;
  status: 'Initiated' | 'In Progress' | 'Legally Resolved' | 'On Hold';
  initiated_date: string;
  resolved_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOffboardingChecklistItem {
  id: string;
  offboarding_case_id: string;
  title: string;
  description?: string;
  stage_number: number;
  status: 'Pending' | 'Completed';
  assigned_user_id?: string;
  updated_at: string;
}

export interface DatabaseAuditLog {
  id: string;
  workspace_id: string;
  actor_user_id?: string;
  actor_display_name?: string;
  entity_type: string;
  entity_id?: string;
  action: string;
  source: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  created_at: string;
}
