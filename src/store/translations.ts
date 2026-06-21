/**
 * Dynamic Translation Dictionary for Bilingual English and Arabic
 */

export const dictionary = {
  en: {
    appName: "Wakeel Aman",
    appSubtitle: "Secure LSA Compliance Hub",
    tagline: "Know every company connected to your name before it becomes a problem.",
    disclaimerTitle: "Administrative Compliance Disclaimer",
    disclaimerText: "Wakeel Aman is an administrative, visual record-keeping, and risk-management workspace tool. Information and expiries are maintained manually or entered from user files. This platform does not possess absolute direct real-time hooks to state government regulatory records (DED, Mohre, Gdrfa) and is not a substitute for formal, authorized corporate legal services in the UAE.",
    searchPlaceholder: "Search records, trade licenses, emirates...",
    languageSwitchLabel: "العربية",
    roleLabel: "View as role:",
    
    // Nav menu
    menuOverview: "Overview",
    menuCompanies: "Companies",
    menuApprovals: "Digital approvals",
    menuDocuments: "Document Vault",
    menuRenewals: "Renewals & Expiries",
    menuTasks: "Tasks Board",
    menuInvoices: "Invoices & Fees",
    menuOffboarding: "Exit/Offboarding",
    menuCRM: "CRM Contacts",
    menuReports: "Reports Matrix",
    menuAudit: "System Audit",

    // Dashboard Items
    activeCompanies: "Active Entities",
    highRiskCompanies: "High Risk Files",
    pendingSignatures: "Pending Signatures",
    overdueInvoices: "Overdue Invoices",
    upcomingRenewals: "Renewals next 30d",
    unresponsiveContact: "No-Response Partners",
    riskOverviewTitle: "Fiduciary Risk Overview",
    riskLow: "Low Risk",
    riskModerate: "Moderate Risk",
    riskHigh: "High Risk",
    riskCritical: "Critical Risk",
    whyRiskTriggered: "Risk Engine Explanation Traits",
    recentAuditTitle: "Immutable Administrative Log",
    quickActions: "Quick Actions Desk",
    newCompanyWizardBtn: "Enroll Corporate Client",

    // Companies page
    companyName: "Company Name",
    licenseNo: "Trade License",
    emirateLabel: "Emirate",
    legalFormLabel: "Legal Form",
    relationshipLabel: "Service Type",
    statusLabel: "Status",
    expiryLabel: "Expiry date",
    riskScoreLabel: "Risk Score",
    actionLabel: "Options",
    addCompSuccess: "Company successfully onboarded to registry",
    allTabsOverview: "Overview Docs",
    allTabsRisk: "Risk Indicators",
    allTabsDocuments: "Vault Files",
    allTabsAgreements: "LSA Terms",
    allTabsApprovals: "Signatures Log",
    allTabsTasks: "Tasks",
    allTabsInvoices: "Fee Ledger",
    allTabsContacts: "Investor bio",
    allTabsComm: "Communications",
    allTabsOffboard: "Exit File",
    allTabsAudit: "File Audit Logs",

    // Documents Vault
    uploadDocument: "Vault document upload",
    docCategory: "Document Class",
    issueDate: "Issue date",
    docStatusVerified: "Verified",
    docStatusPending: "Pending Review",
    docStatusExpired: "Expired",
    docStatusRejected: "Rejected & Flagged",

    // Signatures
    signatureAuditTitle: "Digital Approval & Signatures Loop",
    approvalStatusText: "Approval state",
    approveBtn: "Approve Sign",
    rejectBtn: "Reject Request",
    clarificationBtn: "Clarify Info",
    oneTimeCode: "Local Passcode Verification",
    signDisclaimer: "This marks a formal internal record of Local Service Agent consent. It stores IP, Device stamp and OTP approval loops.",

    // Invoices
    invoiceTitle: "Administrative Fees & Service Invoices",
    addInvoiceBtn: "Raise LSA Invoice",
    payProofBtn: "Record bank receipt copy",
    confirmPayment: "Authorize payments entry",

    // Offboarding
    offboardCaseTitle: "Exit & Agent Replacement Workflows",
    caseOpenedDate: "Initiation date",
    checklistHeader: "LSA Protection diligence checklists",
    exportReportBtn: "Export diligence PDF dossier",

    // General terms
    save: "Save record",
    cancel: "Cancel",
    next: "Next step",
    back: "Back",
    confirm: "Confirm",
    arLanguageSelected: " Arabic RTL activated",
    enLanguageSelected: "English layout activated"
  },
  ar: {
    appName: "وكيل آمن",
    appSubtitle: "مركز امتثال وكيل الخدمات المحلي",
    tagline: "اعرف كل شركة مرتبطة باسمك قبل أن تتحول إلى مشكلة.",
    disclaimerTitle: "إخلاء المسؤولية الإدارية والامتثال",
    disclaimerText: "منصة وكيل آمن هي أداة إدارية إلكترونية لمتابعة الوثائق وإدارة المخاطر. جميع البيانات وتواريخ الصلاحية تُدار يدوياً أو تُستخرج من مستندات المستخدم. لا تمتلك المنصة رابطاً مباشراً ببيانات الجهات الحكومية (مثل دوائر التنمية الاقتصادية أو تسهيل) ولا بديل عن الاستشاري القانوني المرخص لدولة الإمارات.",
    searchPlaceholder: "ابحث عن الشركات، الرخص التجارية، الإمارات...",
    languageSwitchLabel: "English",
    roleLabel: "عرض بصلاحية:",

    // Nav menu
    menuOverview: "لوحة التحكم",
    menuCompanies: "محفظة الشركات",
    menuApprovals: "الاعتمادات والتواقيع",
    menuDocuments: "خزنة الوثائق",
    menuRenewals: "التجديدات والصلاحيات",
    menuTasks: "جدول المهام",
    menuInvoices: "الرسوم والفواتير",
    menuOffboarding: "إنهاء العلاقة والانسحاب",
    menuCRM: "المستثمرين والاتصالات",
    menuReports: "التقارير التحليلية",
    menuAudit: "سجل التدقيق العام",

    // Dashboard Items
    activeCompanies: "الشركات النشطة",
    highRiskCompanies: "الملفات عالية الخطورة",
    pendingSignatures: "اعتمادات معلقة",
    overdueInvoices: "متأخرات الرسوم",
    upcomingRenewals: "تجديدات خلال 30 يوماً",
    unresponsiveContact: "مستثمرون لا يستجيبون",
    riskOverviewTitle: "مؤشر المخاطر والالتزامات",
    riskLow: "مخاطر منخفضة",
    riskModerate: "مخاطر متوسطة",
    riskHigh: "مخاطر عالية",
    riskCritical: "مخاطر حرجة جداً",
    whyRiskTriggered: "أسباب تقييم محرك المخاطر",
    recentAuditTitle: "سجل التدقيق الإداري المحمي",
    quickActions: "مكتب الإجراءات السريعة",
    newCompanyWizardBtn: "قيد شركة جديدة",

    // Companies page
    companyName: "اسم الشركة",
    licenseNo: "الرخصة التجارية",
    emirateLabel: "الإمارة",
    legalFormLabel: "الشكل القانوني",
    relationshipLabel: "نوع العلاقة",
    statusLabel: "الحالة",
    expiryLabel: "تاريخ الانتهاء",
    riskScoreLabel: "مؤشر الخطر",
    actionLabel: "الخيارات",
    addCompSuccess: "تم تسجيل وتفعيل وثائق المنشأة بنجاح",
    allTabsOverview: "ملخص المستندات",
    allTabsRisk: "عوامل الخطر",
    allTabsDocuments: "الوثائق المرفوعة",
    allTabsAgreements: "اتفاقية وكيل الخدمات",
    allTabsApprovals: "سجل التواقيع المعتمد",
    allTabsTasks: "المهام الإلزامية",
    allTabsInvoices: "جدول المستحقات المالي",
    allTabsContacts: "تفاصيل المستثمر وممثليه",
    allTabsComm: "سجل المراسلات والرسائل",
    allTabsOffboard: "خطة الانسحاب والتنازل",
    allTabsAudit: "تاريخ تعديلات الملف",

    // Documents Vault
    uploadDocument: "رفع وثيقة رسمية للخزنة",
    docCategory: "فئة الوثيقة الرسمية",
    issueDate: "تاريخ الإصدار",
    docStatusVerified: "معتمد وموثق",
    docStatusPending: "قيد المراجعة والتدقيق",
    docStatusExpired: "منتهي الصلاحية",
    docStatusRejected: "مرفوض ومحذوف به خطأ",

    // Signatures
    signatureAuditTitle: "التواقيع الرقمية واعتماد المعاملات",
    approvalStatusText: "حالة الطلب الإجرائي",
    approveBtn: "موافقة وتوقيع إلكتروني",
    rejectBtn: "رفض الطلب",
    clarificationBtn: "طلب توضيح",
    oneTimeCode: "رمز التحقق الثنائي المؤقت",
    signDisclaimer: "هذا التسجيل هو نظام أمان داخلي لحفظ موافقة وكيل الخدمات بالتوقيع. يُسجل الـ IP ونوع الجهاز ورمز التحقق وتوقيت المعاملة لأغراض التدقيق القانونية.",

    // Invoices
    invoiceTitle: "رسوم الخدمات السنوية وفواتير PRO",
    addInvoiceBtn: "إصدار فاتورة جديدة",
    payProofBtn: "إرسال إيصال التحويل البنكي",
    confirmPayment: "اعتماد واستلام الحوالة المالي",

    // Offboarding
    offboardCaseTitle: "سجل إنهاء وكالة الخدمات ونقل الكفالة",
    caseOpenedDate: "تاريخ بدء الملف",
    checklistHeader: "قائمة مهام حماية وكيل الخدمات الإدارية",
    exportReportBtn: "تصدير الملف التدقيقي الكامل PDF",

    // General terms
    save: "حفظ السجل",
    cancel: "إلغاء",
    next: "الخطوة التالية",
    back: "رجوع",
    confirm: "تأكيد الإجراء",
    arLanguageSelected: "تم تشغيل وتفعيل واجهة اللغة العربية RTL",
    enLanguageSelected: "تم تشغيل وتفعيل واجهة اللغة الإنجليزية LTR"
  }
};
