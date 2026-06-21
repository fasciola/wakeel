import { Company, Document, Invoice, Task, OffboardingCase, Contact } from '../types';

export interface RiskEvaluation {
  score: number;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  reasons: { rule: string; change: number; en: string; ar: string }[];
}

export function evaluateCompanyRisk(
  company: Company,
  companyDocs: Document[],
  companyInvoices: Invoice[],
  companyTasks: Task[],
  companyCases: OffboardingCase[],
  companyContacts: Contact[]
): RiskEvaluation {
  let score = 0;
  const reasons: RiskEvaluation['reasons'] = [];

  const today = new Date('2026-06-20');

  // Rule 1: Expired trade licence: +35
  const expiry = new Date(company.licenceExpiryDate);
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    score += 35;
    reasons.push({
      rule: 'EXPIRED_LICENCE',
      change: 35,
      en: 'Trade licence has expired (+35)',
      ar: 'الرخصة التجارية منتهية الصلاحية (+35)'
    });
  } 
  // Rule 2: Licence expires within 30 days: +20
  else if (diffDays <= 30) {
    score += 20;
    reasons.push({
      rule: 'SOON_EXPIRED_LICENCE',
      change: 20,
      en: 'Trade licence expires within 30 days (+20)',
      ar: 'الرخصة تحتوي على أقل من 30 يوما للصلاحية (+20)'
    });
  }

  // Rule 3: Expired service-agent agreement: +25
  const hasExpiredAgreement = company.notes?.toLowerCase().includes('expired agreement') || false;
  if (hasExpiredAgreement) {
    score += 25;
    reasons.push({
      rule: 'EXPIRED_AGREEMENT',
      change: 25,
      en: 'Expired service-agent agreement (+25)',
      ar: 'اتفاقية وكيل الخدمات منتهية الصلاحية (+25)'
    });
  }

  // Rule 4: Annual fee overdue more than 30 days: +15
  const overdueFeeInvoices = companyInvoices.filter(i => {
    if (i.paymentStatus !== 'Overdue') return false;
    const due = new Date(i.dueDate);
    const overdueDays = Math.round((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return overdueDays > 30;
  });
  if (overdueFeeInvoices.length > 0) {
    score += 15;
    reasons.push({
      rule: 'FEE_OVERDUE',
      change: 15,
      en: 'Annual fee overdue more than 30 days (+15)',
      ar: 'الرسوم السنوية متأخرة لأكثر من 30 يوماً (+15)'
    });
  }

  // Rule 5: Investor not responding for more than 14 days: +10
  const unresponsiveContacts = companyContacts.filter(c => c.relationshipStatus === 'Not Responding');
  if (unresponsiveContacts.length > 0) {
    score += 10;
    reasons.push({
      rule: 'UNRESPONSIVE_INVESTOR',
      change: 10,
      en: 'Investor not responding/uncommunicative (+10)',
      ar: 'المستثمر لا يستجيب للاتصالات لأكثر من 14 يوماً (+10)'
    });
  }

  // Rule 6: Missing core documents: +10
  const hasMOA = companyDocs.some(d => d.documentType?.toUpperCase() === 'MOA');
  const hasLicense = companyDocs.some(d => d.documentType?.toUpperCase() === 'TRADE LICENCE');
  if (!hasMOA || !hasLicense) {
    score += 10;
    reasons.push({
      rule: 'MISSING_DOCS',
      change: 10,
      en: 'Missing core compliance files (MOA or active Licence scan) (+10)',
      ar: 'مستندات التأسيس الأساسية مفقودة مثل عقد التأسيس (+10)'
    });
  }

  // Rule 7: Overdue compliance task: +8
  const overdueTasks = companyTasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < today);
  if (overdueTasks.length > 0) {
    score += 8;
    reasons.push({
      rule: 'OVERDUE_COMPLIANCE_TASK',
      change: 8,
      en: 'Mandatory compliance tasks overdue (+8)',
      ar: 'مهام الالتزام الحكومي متجاوزة موعد التسليم (+8)'
    });
  }

  // Rule 8: Open offboarding case: +15
  const openOffboarding = companyCases.filter(c => c.status !== 'Completed' && c.status !== 'Closed Without Completion');
  if (openOffboarding.length > 0) {
    score += 15;
    reasons.push({
      rule: 'OPEN_OFFBOARDING',
      change: 15,
      en: 'Open active agency exit/offboarding case (+15)',
      ar: 'ملف إلغاء العلاقة أو فك الارتباط نشط حاليًا (+15)'
    });
  }

  // Rule 9: Manual high-risk flag based on notes/violations: +20
  const manualWarning = company.notes?.toLowerCase().includes('dispute') || company.notes?.toLowerCase().includes('violation');
  if (manualWarning) {
    score += 20;
    reasons.push({
      rule: 'MANUAL_DISPUTE_FLAG',
      change: 20,
      en: 'Active legal dispute or compliance violation noted on file (+20)',
      ar: 'نزاع قانوني نشط أو مخالفة مسجلة في ملف المنشأة (+20)'
    });
  }

  // Limit final score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine levels
  let level: RiskEvaluation['level'] = 'Low';
  if (score >= 80) level = 'Critical';
  else if (score >= 60) level = 'High';
  else if (score >= 30) level = 'Moderate';

  return { score, level, reasons };
}
