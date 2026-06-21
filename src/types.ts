/**
 * Types for Wakeel Aman | وكيل آمن Relational Database Schema
 */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string; // admin, workspace_owner, agent, manager, pro, investor, advisor
  preferredLanguage: 'en' | 'ar';
  isActive: boolean;
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  nameEn: string;
  nameAr: string;
  workspaceType: string;
  logoUrl?: string;
  timezone: string;
  subscriptionPlan: 'Starter' | 'Professional' | 'Business';
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  permissionsJson: string; // stringified permissions array
  status: 'active' | 'suspended' | 'pending';
}

export interface Company {
  id: string;
  workspaceId: string;
  legalNameEn: string;
  legalNameAr: string;
  tradeLicenceNumber: string;
  emirate: 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Umm Al Quwain' | 'Ras Al Khaimah' | 'Fujairah';
  legalForm: string; // LLC, Sole Establishment, Free Zone LLC, Joint Venture, Branch, etc.
  businessActivity: string;
  registrationDate: string;
  licenceIssueDate: string;
  licenceExpiryDate: string;
  companyStatus: 'Active' | 'Inactive' | 'Under Review' | 'Offboarding' | 'Closed';
  riskScore: number; // 0 to 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  assignedManagerId?: string; // assigned agent user ID or PRO
  annualFee: number;
  feeCurrency: string; // AED, USD
  relationshipType: 'Local Service Agent' | 'Nominee Shareholder' | 'Local Partner' | 'Authorised Signatory' | 'Consultant' | 'PRO Representative' | 'Other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  workspaceId: string;
  fullName: string;
  fullNameAr?: string;
  email: string;
  phone: string;
  nationality: string;
  preferredLanguage: 'en' | 'ar';
  relationshipStatus: 'Active' | 'Responsive' | 'Delayed Response' | 'Not Responding' | 'Under Review' | 'Offboarding' | 'Closed';
  refNumber?: string; // Passport or ID reference number
  notes?: string;
  lastContactDate?: string;
}

export interface CompanyContact {
  id: string;
  companyId: string;
  contactId: string;
  role: string; // Investor, CEO, Representative, Legal, etc.
  isPrimary: boolean;
}

export interface Document {
  id: string;
  workspaceId: string;
  companyId: string;
  documentType: string; // Trade Licence, MOA, Tenancy, POA, Establishment Card, etc.
  title: string;
  filePath: string;
  mimeType: string;
  fileSize: number; // in KB
  issueDate?: string;
  expiryDate?: string;
  verificationStatus: 'Verified' | 'Pending Review' | 'Expired' | 'Rejected';
  versionNumber: number;
  replacedByDocumentId?: string;
  uploadedBy: string; // user ID
  notes?: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  workspaceId: string;
  companyId: string;
  requestTitle: string;
  requestCategory: string; // License Amendment, License Renewal, Visa Request, Bank Letter, NOC, contract, closure, agent replacement, other
  descriptionEn: string;
  descriptionAr: string;
  requestedBy: string; // user ID
  assignedTo?: string; // user ID or role
  dueDate: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Needs More Information' | 'Approved' | 'Rejected' | 'Cancelled' | 'Expired';
  createdAt: string;
  completedAt?: string;
}

export interface ApprovalDecision {
  id: string;
  approvalRequestId: string;
  documentId?: string;
  approverId: string; // user ID
  decision: 'Approve' | 'Reject' | 'Request Clarification' | 'Request Revised Document' | 'Approve with Conditions';
  comments?: string;
  authenticationMethod: string; // TOTP, Passcode, Signatory Proof, Email Loop, IP Record
  ipAddress: string;
  deviceInfo: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  companyId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string; // AED, USD
  subtotal: number;
  vatAmount: number; // usually 5% in UAE
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | 'Written Off';
  createdBy: string; // user ID
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Credit Card' | 'Other';
  paymentDate: string;
  paymentProofDocumentId?: string; // links to document vault
  status: 'Pending Verification' | 'Approved' | 'Rejected';
  approvedBy?: string; // user ID
  notes?: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  companyId: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Waiting for Client' | 'Waiting for Agent' | 'Completed' | 'Cancelled';
  dueDate: string;
  assigneeId?: string; // user ID
  createdBy: string; // user ID
  createdAt: string;
}

export interface RiskEvent {
  id: string;
  companyId: string;
  riskRuleKey: string;
  scoreChange: number;
  explanationEn: string;
  explanationAr: string;
  status: 'Active' | 'Resolved';
  createdAt: string;
}

export interface OffboardingCase {
  id: string;
  workspaceId: string;
  companyId: string;
  title: string;
  reason: string;
  status: 'Case Opened' | 'Investor Notified' | 'Documents Requested' | 'Company Records Reviewed' | 'Pending Items Identified' | 'Transfer Preparation' | 'Closure Preparation' | 'Legal/PRO Review' | 'Awaiting External Completion' | 'Completed' | 'Closed Without Completion';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string; // user ID
  openedAt: string;
  targetDate: string;
  closedAt?: string;
}

export interface OffboardingChecklistItem {
  id: string;
  offboardingCaseId: string;
  title: string;
  description?: string;
  status: 'Pending' | 'Completed' | 'N/A';
  responsibleUserId?: string;
  dueDate?: string;
  evidenceDocumentId?: string; // link to document if resolved
}

export interface Communication {
  id: string;
  workspaceId: string;
  companyId?: string;
  contactId?: string;
  channel: 'Email' | 'WhatsApp' | 'Call' | 'Meeting' | 'Document Request' | 'Notification';
  subject: string;
  content: string;
  direction: 'Incoming' | 'Outgoing' | 'Internal';
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Received' | 'Logged';
  sentAt: string;
  createdBy: string; // user ID
}

export interface Notification {
  id: string;
  userId: string;
  type: string; // warning, expiry, sign_request, system, invoice
  title: string;
  body: string;
  channel: 'In-App' | 'Email' | 'WhatsApp';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  entityType: string; // Company, Document, Invoice, Approval, Task, Case, etc.
  entityId: string;
  action: string; // Create, Update, Delete, Sign, Upload, Pay, etc.
  oldValueJson?: string;
  newValueJson?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}
