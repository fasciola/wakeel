import { 
  User, Workspace, Company, Contact, CompanyContact, 
  Document, ApprovalRequest, ApprovalDecision, Invoice, 
  InvoiceItem, Payment, Task, OffboardingCase, 
  OffboardingChecklistItem, Communication, Notification, AuditLog 
} from '../types';

// Helper to get formatted dates relative to today
export const getRelativeDateString = (daysOffset: number): string => {
  const date = new Date('2026-06-20T23:49:51-07:00'); // Consistent baseline
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// Define initial users of the workspace
export const defaultUsers: User[] = [
  {
    id: 'u1',
    firstName: 'Faisal',
    lastName: 'Al-Mansoori',
    email: 'faisal.owner@wakeel.ae',
    phone: '+971 50 123 4567',
    role: 'workspace_owner',
    preferredLanguage: 'ar',
    isActive: true,
    twoFactorEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2025-01-15T12:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z'
  },
  {
    id: 'u2',
    firstName: 'Fatima',
    lastName: 'Al-Hashimi',
    email: 'fatima.compliance@wakeel.ae',
    phone: '+971 56 987 6543',
    role: 'agent',
    preferredLanguage: 'en',
    isActive: true,
    twoFactorEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2026-06-18T14:30:00Z'
  },
  {
    id: 'u3',
    firstName: 'Ibrahim',
    lastName: 'Al-Harmoodi',
    email: 'ibrahim.pro@wakeel.ae',
    phone: '+971 52 444 8899',
    role: 'pro',
    preferredLanguage: 'ar',
    isActive: true,
    twoFactorEnabled: false,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2025-03-10T09:15:00Z',
    updatedAt: '2026-06-12T11:20:00Z'
  },
  {
    id: 'u_investor',
    firstName: 'Tariq',
    lastName: 'Al-Suwaidi',
    email: 'tariq.s@aperture-investments.com',
    phone: '+971 54 321 0987',
    role: 'investor',
    preferredLanguage: 'ar',
    isActive: true,
    twoFactorEnabled: false,
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2026-06-20T08:00:00Z'
  }
];

export const defaultWorkspace: Workspace = {
  id: 'w1',
  nameEn: 'Al Noor Local Services Co.',
  nameAr: 'النور للخدمات المحلية ش.ذ.م.م',
  workspaceType: 'Corporate Service Group',
  timezone: 'Asia/Dubai',
  subscriptionPlan: 'Professional',
  createdAt: '2025-01-15T12:00:00Z'
};

// Seeding 25 Companies
const rawCompaniesData = [
  { id: 'c1', en: 'Al Noor Medical Services LLC', ar: 'النور للخدمات الطبية ذ.م.م', licence: 'TL-882901', emirate: 'Dubai', form: 'LLC', activity: 'Medical Equipment Trading', offset: -10, fee: 12000, rel: 'Local Service Agent', manager: 'u2', riskNote: '' },
  { id: 'c2', en: 'Al Shurooq Trading LLC', ar: 'الشروق للتجارة ذ.م.م', licence: 'TL-993812', emirate: 'Dubai', form: 'LLC', activity: 'General Trading & Wholesale', offset: 120, fee: 15000, rel: 'Nominee Shareholder', manager: 'u1', riskNote: '' },
  { id: 'c3', en: 'Gulf Shield Cybersecurity', ar: 'درع الخليج للأمن السيبراني', licence: 'TL-443310', emirate: 'Abu Dhabi', form: 'Branch of Foreign Co', activity: 'IT Security Operations', offset: 14, fee: 20000, rel: 'Local Service Agent', manager: 'u2', riskNote: 'Investor unresponsive for document signature requests' },
  { id: 'c4', en: 'Emirates Apex Logistics', ar: 'الإمارات أبيكس للدعم اللوجستي', licence: 'TL-104928', emirate: 'Dubai', form: 'LLC', activity: 'Sea Freight & Cargo Clearing', offset: 250, fee: 18000, rel: 'Local Partner', manager: 'u3', riskNote: '' },
  { id: 'c5', en: 'Jumeirah Tech Solutions', ar: 'حلول جميرا التقنية', licence: 'TL-748392', emirate: 'Dubai', form: 'Sole Establishment', formAr: 'مؤسسة فردية', activity: 'Cloud Design & Tech Consulting', offset: -5, fee: 8000, rel: 'Local Service Agent', manager: 'u2', riskNote: 'License expired! Client is looking for new LSA' },
  { id: 'c6', en: 'Burj Al Arab Hospitality', ar: 'برج العرب للضيافة ش.ذ.م.م', licence: 'TL-552438', emirate: 'Dubai', form: 'LLC', activity: 'Hotel Management & Food Services', offset: 450, fee: 25000, rel: 'Authorised Signatory', manager: 'u1', riskNote: '' },
  { id: 'c7', en: 'Al Maha General Contracting', ar: 'المها للمقاولات العامة', licence: 'TL-662351', emirate: 'Sharjah', form: 'Sole Establishment', activity: 'Building Construction & Contracting', offset: 28, fee: 14000, rel: 'Local Partner', manager: 'u3', riskNote: '' },
  { id: 'c8', en: 'Sadaf Rent A Car', ar: 'صدف لتأجير السيارات', licence: 'TL-332910', emirate: 'Ajman', form: 'Sole Establishment', activity: 'Automobile Rental', offset: -45, fee: 9000, rel: 'Local Service Agent', manager: 'u3', riskNote: 'In liquidation / closed workflow initiated' },
  { id: 'c9', en: 'Falcon Aviation Services', ar: 'فالكون لخدمات الطيران', licence: 'TL-772911', emirate: 'Abu Dhabi', form: 'LLC', activity: 'Aircraft Repair & Parts Import', offset: 15, fee: 35000, rel: 'Authorised Signatory', manager: 'u1', riskNote: '' },
  { id: 'c10', en: 'Desert Rose Spa LLC', ar: 'سبا وردة الصحراء ذ.م.م', licence: 'TL-228391', emirate: 'Dubai', form: 'LLC', activity: 'Women Salon & Spa', offset: 95, fee: 10000, rel: 'Local Service Agent', manager: 'u2', riskNote: '' },
  { id: 'c11', en: 'Marina Yacht Charters', ar: 'مارينا لتأجير اليخوت', licence: 'TL-119283', emirate: 'Dubai', form: 'LLC', activity: 'Maritime Leisure Operations', offset: 150, fee: 22000, rel: 'Nominee Shareholder', manager: 'u1', riskNote: '' },
  { id: 'c12', en: 'Arabian Dunes Real Estate', ar: 'عجمان العقارية', licence: 'TL-667384', emirate: 'Ajman', form: 'LLC', activity: 'Property Brokerage & Leasing', offset: 80, fee: 11000, rel: 'Consultant', manager: 'u2', riskNote: '' },
  { id: 'c13', en: 'Pearl Star Jewellers', ar: 'نجمة اللؤلؤ للمجوهرات', licence: 'TL-551109', emirate: 'Dubai', form: 'LLC', activity: 'Gold Trading & Gemstones Retail', offset: 2, fee: 20000, rel: 'Local Partner', manager: 'u2', riskNote: 'Undergoing agent transfer due to fee dispute' },
  { id: 'c14', en: 'Falcon Eye Logistics LLC', ar: 'فالكون آي للخدمات اللوجستية', licence: 'TL-883391', emirate: 'Sharjah', form: 'LLC', activity: 'Logistics Services', offset: 400, fee: 13000, rel: 'Local Service Agent', manager: 'u3', riskNote: '' },
  { id: 'c15', en: 'Abu Dhabi Foodstuffs Est.', ar: 'مؤسسة أبوظبي للمواد الغذائية', licence: 'TL-339281', emirate: 'Abu Dhabi', form: 'Sole Establishment', activity: 'Foodstuff Import & Export', offset: -25, fee: 10000, rel: 'Local Service Agent', manager: 'u1', riskNote: 'Fees unpaid for 3 months.' },
  { id: 'c16', en: 'Sharjah Book Distributors', ar: 'الشارقة لموزعي الكتب', licence: 'TL-991122', emirate: 'Sharjah', form: 'Sole Establishment', activity: 'Book & Educational Materials Distribution', offset: 35, fee: 9500, rel: 'PRO Representative', manager: 'u3', riskNote: '' },
  { id: 'c17', en: 'Al Ain Dairy Products Distributor', ar: 'موزع منتجات ألبان العين', licence: 'TL-448831', emirate: 'Abu Dhabi', form: 'Sole Establishment', activity: 'Dairy Wholesalers', offset: 180, fee: 11500, rel: 'Local Service Agent', manager: 'u2', riskNote: '' },
  { id: 'c18', en: 'Umm Al Quwain Marine Works', ar: 'أم القيوين للأعمال البحرية', licence: 'TL-551234', emirate: 'Umm Al Quwain', form: 'Sole Establishment', activity: 'Boat Repair & Maintenance Workshops', offset: 5, fee: 8500, rel: 'Local Service Agent', manager: 'u3', riskNote: '' },
  { id: 'c19', en: 'Fujairah Shipping Services', ar: 'الفجيرة للخدمات الملاحية', licence: 'TL-776655', emirate: 'Fujairah', form: 'LLC', activity: 'Marine Cargo Clearing', offset: 320, fee: 16000, rel: 'Nominee Shareholder', manager: 'u1', riskNote: '' },
  { id: 'c20', en: 'Ras Al Khaimah Ceramic Trade', ar: 'تجارة سيراميك رأس الخيمة', licence: 'TL-995533', emirate: 'Ras Al Khaimah', form: 'LLC', activity: 'Tile & Sanitaryware Exports', offset: 12, fee: 12500, rel: 'Local Partner', manager: 'u3', riskNote: '' },
  { id: 'c21', en: 'Ajman Garments Industry', ar: 'عجمان لصناعة الملابس', licence: 'TL-886644', emirate: 'Ajman', form: 'LLC', activity: 'Apparel Manufacturing', offset: 50, fee: 15000, rel: 'Local Service Agent', manager: 'u1', riskNote: '' },
  { id: 'c22', en: 'Red Sea Oilfield Services', ar: 'البحر الأحمر لخدمات حقول النفط', licence: 'TL-221199', emirate: 'Abu Dhabi', form: 'LLC', activity: 'Oilfield Gas Tech Engineering', offset: 600, fee: 40000, rel: 'Authorised Signatory', manager: 'u2', riskNote: '' },
  { id: 'c23', en: 'Phoenix Digital Media LLC', ar: 'فينيكس للإعلام الرقمي ذ.م.م', licence: 'TL-903827', emirate: 'Dubai', form: 'LLC', activity: 'Advertising and Online Media', offset: 18, fee: 12000, rel: 'Consultant', manager: 'u3', riskNote: '' },
  { id: 'c24', en: 'Oasis Smart Farming', ar: 'واحة الزراعة الذكية', licence: 'TL-602938', emirate: 'Umm Al Quwain', form: 'LLC', activity: 'Agricultural Innovations & Tech', offset: 110, fee: 14000, rel: 'Local Partner', manager: 'u2', riskNote: '' },
  { id: 'c25', en: 'Al Khaleej Steel Mills', ar: 'مصانع حديد الخليج', licence: 'TL-301192', emirate: 'Ras Al Khaimah', form: 'Branch of Foreign Co', activity: 'Heavy Metal Manufacturing & Milling', offset: -2, fee: 50000, rel: 'Local Service Agent', manager: 'u1', riskNote: 'Closed status initiated. Severe environmental citation issued recently.' }
];

export const seedCompanies = (): Company[] => {
  return rawCompaniesData.map((d, index) => {
    const isExpired = d.offset < 0;
    const isSoon = d.offset >= 0 && d.offset <= 30;
    
    let status: Company['companyStatus'] = 'Active';
    if (d.id === 'c8' || d.id === 'c25') {
      status = 'Closed';
    } else if (d.id === 'c5' || d.id === 'c13') {
      status = 'Under Review';
    } else if (d.id === 'c8' || d.id === 'c3') {
      status = 'Offboarding';
    }

    return {
      id: d.id,
      workspaceId: 'w1',
      legalNameEn: d.en,
      legalNameAr: d.ar,
      tradeLicenceNumber: d.licence,
      emirate: d.emirate as Company['emirate'],
      legalForm: d.form,
      businessActivity: d.activity,
      registrationDate: getRelativeDateString(-365 * 2), // 2 years ago
      licenceIssueDate: getRelativeDateString(-365 + d.offset),
      licenceExpiryDate: getRelativeDateString(d.offset),
      companyStatus: status,
      riskScore: 0, // Calculated dynamically
      riskLevel: 'Low', // Calculated dynamically
      assignedManagerId: d.manager,
      annualFee: d.fee,
      feeCurrency: 'AED',
      relationshipType: d.rel as Company['relationshipType'],
      notes: d.riskNote || undefined,
      createdAt: getRelativeDateString(-365 * 2),
      updatedAt: getRelativeDateString(-5)
    };
  });
};

// Seeding 40 Contacts
const rawContactsData = [
  { id: 'con1', name: 'Tariq Al-Suwaidi', nameAr: 'طارق السويدي', nat: 'UAE', lang: 'ar', email: 'tariq.s@aperture-investments.com', phone: '+971 54 321 0987', status: 'Active', ref: 'N-82910' },
  { id: 'con2', name: 'Marcus Sterling', nameAr: 'ماركوس ستيرلينغ', nat: 'UK', lang: 'en', email: 'marcus@sterlingholdings.co.uk', phone: '+44 7911 123456', status: 'Active', ref: 'P-99211' },
  { id: 'con3', name: 'Rajesh Malhotra', nameAr: 'راجيش مالهوترا', nat: 'India', lang: 'en', email: 'rajesh@reddyindustries.co.in', phone: '+91 98200 12345', status: 'Delayed Response', ref: 'P-11234' },
  { id: 'con4', name: 'Youssef El-Haddad', nameAr: 'يوسف الحداد', nat: 'Lebanon', lang: 'ar', email: 'youssef@haddadlegal.com', phone: '+961 3 123 456', status: 'Active', ref: 'P-88221' },
  { id: 'con5', name: 'Elena Rostov', nameAr: 'إيلينا روستوف', nat: 'Russia', lang: 'en', email: 'elena@novapower.ru', phone: '+7 901 123-4567', status: 'Not Responding', ref: 'P-77212' },
  { id: 'con6', name: 'Jean-Pierre Dubois', nameAr: 'جان بيير دوبوا', nat: 'France', lang: 'en', email: 'jp.dubois@luxecatering.fr', phone: '+33 6 1234 5678', status: 'Active', ref: 'P-31029' },
  { id: 'con7', name: 'Chao Wang', nameAr: 'تشاو وانغ', nat: 'China', lang: 'en', email: 'chao.wang@apexchina.cn', phone: '+86 139 1234 5678', status: 'Active', ref: 'P-29173' },
  { id: 'con8', name: 'Hans Mueller', nameAr: 'هانس مولر', nat: 'Germany', lang: 'en', email: 'mueller@berlinsteel.de', phone: '+49 170 1234567', status: 'Under Review', ref: 'P-44912' },
  { id: 'con9', name: 'Yasmin Al-Fahim', nameAr: 'ياسمين الفهيم', nat: 'UAE', lang: 'ar', email: 'yasmin@fahim-consulting.ae', phone: '+971 50 222 3344', status: 'Active', ref: 'N-33410' },
  { id: 'con10', name: 'Michael Novak', nameAr: 'مايكل نوفاك', nat: 'USA', lang: 'en', email: 'michael@novaktech.web', phone: '+1 650 555 0192', status: 'Active', ref: 'P-99215' },
  // Adding bulk placeholders for 40 completed list
  ...Array.from({ length: 30 }).map((_, i) => {
    const id = `con_auto_${i + 11}`;
    const firstNames = ['Amr', 'David', 'Vijay', 'Sophia', 'Omar', 'Klaus', 'Takahiro', 'Ahmed', 'Zainab', 'Sarah'];
    const lastNames = ['Hassan', 'Jones', 'Patel', 'Martinez', 'Ghanem', 'Schulz', 'Tanaka', 'Siddiqui', 'Malek', 'Kemp'];
    const nats = ['Egypt', 'USA', 'India', 'Spain', 'Lebanon', 'Germany', 'Japan', 'Pakistan', 'UAE', 'Australia'];
    
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const nat = nats[i % nats.length];
    const isAr = nat === 'UAE' || nat === 'Egypt' || nat === 'Lebanon';

    return {
      id,
      name: `${fn} ${ln}`,
      nameAr: isAr ? `${fn} ${ln}` : undefined,
      nat: nat,
      lang: (isAr ? 'ar' : 'en') as 'en' | 'ar',
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@partner-auto${i}.com`,
      phone: `+971 5${i % 9} ${1000000 + i * 15321}`,
      status: (i % 8 === 0 ? 'Not Responding' : i % 5 === 0 ? 'Delayed Response' : 'Active') as Contact['relationshipStatus'],
      ref: `P-AUTO${1000 + i}`
    };
  })
];

export const seedContacts = (): Contact[] => {
  return rawContactsData.map(c => ({
    id: c.id,
    workspaceId: 'w1',
    fullName: c.name,
    fullNameAr: c.nameAr,
    email: c.email,
    phone: c.phone,
    nationality: c.nat,
    preferredLanguage: c.lang as 'en' | 'ar',
    relationshipStatus: c.status as Contact['relationshipStatus'],
    refNumber: c.ref,
    lastContactDate: getRelativeDateString(-(5 + (c.id === 'con5' ? 25 : 2))),
    notes: c.id === 'con5' ? 'Investor left the country. Visas expire soon.' : undefined
  }));
};

// Junction mapping between Companies and Contacts
export const seedCompanyContacts = (): CompanyContact[] => {
  const associations: CompanyContact[] = [];
  
  // Explicit linkages
  associations.push({ id: 'cc1', companyId: 'c1', contactId: 'con1', role: 'CEO / Partner', isPrimary: true });
  associations.push({ id: 'cc2', companyId: 'c2', contactId: 'con2', role: 'Main Shareholder', isPrimary: true });
  associations.push({ id: 'cc3', companyId: 'c3', contactId: 'con5', role: 'Managing Partner', isPrimary: true }); // Rostov - High Risk
  associations.push({ id: 'cc4', companyId: 'c4', contactId: 'con3', role: 'Representative', isPrimary: true });
  associations.push({ id: 'cc5', companyId: 'c5', contactId: 'con4', role: 'Principal Owner', isPrimary: true });
  associations.push({ id: 'cc6', companyId: 'c6', contactId: 'con6', role: 'Managing Director', isPrimary: true });
  associations.push({ id: 'cc7', companyId: 'c7', contactId: 'con7', role: 'Owner representative', isPrimary: true });
  associations.push({ id: 'cc8', companyId: 'c8', contactId: 'con8', role: 'Director', isPrimary: true });
  associations.push({ id: 'cc9', companyId: 'c9', contactId: 'con9', role: 'Co-Founder', isPrimary: true });
  associations.push({ id: 'cc10', companyId: 'c10', contactId: 'con10', role: 'Manager', isPrimary: true });

  // Bulk linkages for remaining companies
  for (let i = 11; i <= 25; i++) {
    associations.push({
      id: `cc_${i}`,
      companyId: `c${i}`,
      contactId: `con_auto_${i}`,
      role: 'Partner',
      isPrimary: true
    });
  }

  return associations;
};

// Seeding 50 Documents
export const seedDocuments = (): Document[] => {
  const docs: Document[] = [];
  let docCount = 1;

  // Let's seed 2 keys docs for each of the 25 companies
  for (let i = 1; i <= 25; i++) {
    const comId = `c${i}`;
    const com = rawCompaniesData.find(c => c.id === comId);
    if (!com) continue;

    // Doc 1: Trade Licence
    const isLicenceExpired = com.offset < 0;
    docs.push({
      id: `doc_${docCount++}`,
      workspaceId: 'w1',
      companyId: comId,
      documentType: 'Trade Licence',
      title: `Trade Licence expiry ${getRelativeDateString(com.offset)}`,
      filePath: `/vault/w1/${comId}/trade_licence.pdf`,
      mimeType: 'application/pdf',
      fileSize: 450 + (i * 12),
      issueDate: getRelativeDateString(-365 + com.offset),
      expiryDate: getRelativeDateString(com.offset),
      verificationStatus: isLicenceExpired ? 'Expired' : 'Verified',
      versionNumber: 1,
      uploadedBy: 'u2',
      notes: isLicenceExpired ? 'Immediate renewal required' : 'Verified by PRO',
      createdAt: getRelativeDateString(-360 + com.offset)
    });

    // Doc 2: LSA Agreement
    const isLsaExpired = com.offset < -5;
    docs.push({
      id: `doc_${docCount++}`,
      workspaceId: 'w1',
      companyId: comId,
      documentType: 'Local Service Agent Agreement',
      title: `LSA Agreement - Signed Version`,
      filePath: `/vault/w1/${comId}/lsa_agreement.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1200 + i,
      issueDate: getRelativeDateString(-365 + com.offset),
      expiryDate: getRelativeDateString(com.offset + 90), // Usually expires later or on same
      verificationStatus: isLsaExpired ? 'Expired' : 'Verified',
      versionNumber: 2,
      uploadedBy: 'u1',
      createdAt: getRelativeDateString(-360 + com.offset)
    });
  }

  // Add custom extra documents like Passport copies, Corporate Tax, MOA, Tenancy etc to reach 50
  const docTypes = ['Memorandum of Association', 'Tenancy Contract', 'Passport Copy', 'Corporate Tax Certificate', 'Establishment Card'];
  for (let i = 0; i < 15; i++) {
    const parentCompanyIndex = (i % 25) + 1;
    docs.push({
      id: `doc_${docCount++}`,
      workspaceId: 'w1',
      companyId: `c${parentCompanyIndex}`,
      documentType: docTypes[i % docTypes.length],
      title: `${docTypes[i % docTypes.length]} - Corporate Record`,
      filePath: `/vault/w1/c${parentCompanyIndex}/evidence_${i}.pdf`,
      mimeType: 'application/pdf',
      fileSize: 320 + i * 40,
      issueDate: getRelativeDateString(-190),
      verificationStatus: i === 4 ? 'Pending Review' : 'Verified',
      versionNumber: 1,
      uploadedBy: 'u3',
      createdAt: getRelativeDateString(-180)
    });
  }

  return docs;
};

// Seeding 15 Pending Approvals
export const seedApprovals = (): ApprovalRequest[] => {
  const categories = [
    'Trade licence amendment', 'Visa-related request', 'Banking letter', 
    'NOC', 'Agreement renewal', 'Company closure'
  ];
  
  const requests: ApprovalRequest[] = [];
  
  // Create 15 requests
  for (let i = 1; i <= 15; i++) {
    const companyIndex = (i % 25) + 1;
    const cat = categories[i % categories.length];
    const isOverdue = i <= 3; // First 3 are pending/overdue
    
    requests.push({
      id: `app_${i}`,
      workspaceId: 'w1',
      companyId: `c${companyIndex}`,
      requestTitle: `${cat} - Signature Needed`,
      requestCategory: cat,
      descriptionEn: `Request to approve and register the ${cat.toLowerCase()} in relation to active commercial license operations.`,
      descriptionAr: `طلب اعتماد وتسجيل ${cat} المتعلق بعمليات الترخيص التجاري النشط.`,
      requestedBy: i % 2 === 0 ? 'u3' : 'u_investor',
      assignedTo: 'u1',
      dueDate: getRelativeDateString(isOverdue ? -3 : 4),
      riskLevel: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
      status: i <= 8 ? 'Under Review' : i <= 12 ? 'Approved' : 'Needs More Information',
      createdAt: getRelativeDateString(-i)
    });
  }
  return requests;
};

// Seeding 10 Overdue Invoices
export const seedInvoices = (): Invoice[] => {
  const invoices: Invoice[] = [];
  
  // We want 10 overdue invoices
  for (let i = 1; i <= 10; i++) {
    const companyIndex = i * 2; // target Al Shurooq, Gulf Shield, Jumeirah, etc (c2, c4, c6, c8, c10...)
    const feeAmount = rawCompaniesData[companyIndex - 1]?.fee || 12000;
    
    invoices.push({
      id: `inv_${i}`,
      workspaceId: 'w1',
      companyId: `c${companyIndex}`,
      invoiceNumber: `WA-2026-${1000 + i}`,
      invoiceDate: getRelativeDateString(-45),
      dueDate: getRelativeDateString(-15), // overdue by 15 days
      currency: 'AED',
      subtotal: feeAmount,
      vatAmount: Math.round(feeAmount * 0.05),
      discountAmount: 0,
      totalAmount: Math.round(feeAmount * 1.05),
      paymentStatus: 'Overdue',
      createdBy: 'u2',
      notes: 'Annual LSA Fees for period 2026-2027. Reminders dispatched.'
    });
  }

  // Standard paid invoices to balance
  for (let i = 11; i <= 20; i++) {
    const companyIndex = ((i - 10) * 2) - 1; // c1, c3, c5, c7...
    const feeAmount = rawCompaniesData[companyIndex - 1]?.fee || 12000;
    invoices.push({
      id: `inv_${i}`,
      workspaceId: 'w1',
      companyId: `c${companyIndex}`,
      invoiceNumber: `WA-2026-${1000 + i}`,
      invoiceDate: getRelativeDateString(-60),
      dueDate: getRelativeDateString(-30),
      currency: 'AED',
      subtotal: feeAmount,
      vatAmount: Math.round(feeAmount * 0.05),
      discountAmount: 100,
      totalAmount: Math.round(feeAmount * 1.05 - 100),
      paymentStatus: 'Paid',
      createdBy: 'u2',
      notes: 'LSA Fees - Payment received via bank transfer'
    });
  }

  return invoices;
};

// Seeding 4 Offboarding Cases
export const seedOffboarding = (): OffboardingCase[] => {
  return [
    {
      id: 'off_1',
      workspaceId: 'w1',
      companyId: 'c3', // Gulf Shield (has unresponsive investor)
      title: 'Exit Route due to Persistent Partner Non-Response',
      reason: 'Investor has not responded to annual compliance requests. Potential labor quota fine exposure risk.',
      status: 'Investor Notified',
      riskLevel: 'High',
      assignedTo: 'u2',
      openedAt: getRelativeDateString(-25),
      targetDate: getRelativeDateString(10)
    },
    {
      id: 'off_2',
      workspaceId: 'w1',
      companyId: 'c8', // Sadaf Rent A Car (In Liquidation)
      title: 'Company Closure and Agent Retraction',
      reason: 'Sadaf Rent A Car is closing due to shareholder business split. Requires PRO cancellation.',
      status: 'Legal/PRO Review',
      riskLevel: 'Medium',
      assignedTo: 'u3',
      openedAt: getRelativeDateString(-15),
      targetDate: getRelativeDateString(5)
    },
    {
      id: 'off_3',
      workspaceId: 'w1',
      companyId: 'c13', // Pearl Star Jewellers (Fee dispute)
      title: 'Transfer LSA representation to alternative agent',
      reason: 'LSA fee escalation dispute. Shareholders resolved to nominate sister company sponsor.',
      status: 'Transfer Preparation',
      riskLevel: 'Critical',
      assignedTo: 'u1',
      openedAt: getRelativeDateString(-5),
      targetDate: getRelativeDateString(2)
    },
    {
      id: 'off_4',
      workspaceId: 'w1',
      companyId: 'c25', // Al Khaleej Steel Mills
      title: 'Force Majeure Agent Retirement',
      reason: 'Environmental regulation breach resulting in heavy municipality citation. Representation risk elevated.',
      status: 'Documents Requested',
      riskLevel: 'Critical',
      assignedTo: 'u2',
      openedAt: getRelativeDateString(-2),
      targetDate: getRelativeDateString(15)
    }
  ];
};

export const seedChecklistItems = (): OffboardingChecklistItem[] => {
  const list: OffboardingChecklistItem[] = [];
  const cases = ['off_1', 'off_2', 'off_3', 'off_4'];
  const baseItems = [
    'Confirm current licence status',
    'Confirm agreement expiry date',
    'Review company documents',
    'Check outstanding annual fees',
    'Request investor acknowledgement',
    'Upload relevant notices',
    'Record investor response or non-response',
    'Identify documents needed for handover',
    'Record PRO or legal adviser involvement',
    'Upload final confirmation evidence'
  ];

  cases.forEach(caseId => {
    baseItems.forEach((title, index) => {
      list.push({
        id: `chk_${caseId}_${index}`,
        offboardingCaseId: caseId,
        title,
        description: `Perform regulatory review for item: ${title}`,
        status: index < 4 ? 'Completed' : 'Pending',
        responsibleUserId: caseId === 'off_2' ? 'u3' : 'u2',
        dueDate: getRelativeDateString(5)
      });
    });
  });

  return list;
};

// Seeding Tasks
export const seedTasks = (): Task[] => {
  const tasks: Task[] = [];
  
  // Seed about 15 tasks
  for (let i = 1; i <= 15; i++) {
    const isCompleted = i % 3 === 0;
    const companyId = `c${(i % 25) + 1}`;
    
    tasks.push({
      id: `t_${i}`,
      workspaceId: 'w1',
      companyId,
      title: i % 4 === 0 
        ? 'Upload renew tenancy contract' 
        : i % 4 === 1 
        ? 'Verify updated corporate tax status' 
        : i % 4 === 2 
        ? 'Remind client for outstanding invoice' 
        : 'Update LSA agreement copy',
      description: 'Important compliance action item tracked in platform records.',
      priority: i % 4 === 0 ? 'Urgent' : i % 4 === 1 ? 'High' : 'Normal',
      status: isCompleted ? 'Completed' : i % 5 === 0 ? 'Waiting for Client' : 'In Progress',
      dueDate: getRelativeDateString(i % 2 === 0 ? -2 : 5), // Some overdue
      assigneeId: i % 3 === 0 ? 'u3' : 'u2',
      createdBy: 'u1',
      createdAt: getRelativeDateString(-10)
    });
  }

  return tasks;
};

// Risk Engine calculator
export function calculateCompanyRiskScore(
  company: Company,
  docs: Document[],
  invoices: Invoice[],
  approvals: ApprovalRequest[],
  tasks: Task[],
  contactsStatus: Contact['relationshipStatus'],
  hasOffboarding: boolean
): { score: number; reasons: { rule: string; score: number }[] } {
  let score = 0;
  const reasons: { rule: string; score: number }[] = [];

  // 1. Trade licence expiry
  const now = new Date('2026-06-20T23:49:51-07:00').getTime();
  const expiry = new Date(company.licenceExpiryDate).getTime();
  const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    score += 35;
    reasons.push({ rule: 'Trade licence has expired', score: 35 });
  } else if (diffDays <= 30) {
    score += 20;
    reasons.push({ rule: 'Trade licence expires within 30 days', score: 20 });
  }

  // 2. Service agent agreement expired - look at documents search or company notes
  // If the LSA doc is marked 'Expired'
  const lsaDocIndex = docs.findIndex(d => d.companyId === company.id && d.documentType === 'Local Service Agent Agreement' && d.verificationStatus === 'Expired');
  if (lsaDocIndex !== -1) {
    score += 25;
    reasons.push({ rule: 'Service agent agreement expired or unverified', score: 25 });
  }

  // 3. Annual fee overdue more than 30 days
  const companyInvoices = invoices.filter(inv => inv.companyId === company.id && inv.paymentStatus === 'Overdue');
  let overdue30 = false;
  companyInvoices.forEach(inv => {
    const dueTime = new Date(inv.dueDate).getTime();
    if ((now - dueTime) / (1000 * 60 * 60 * 24) > 30) {
      overdue30 = true;
    }
  });
  if (overdue30) {
    score += 15;
    reasons.push({ rule: 'Annual service fee overdue more than 30 days', score: 15 });
  } else if (companyInvoices.length > 0) {
    score += 8;
    reasons.push({ rule: 'Has overdue unpaid fees', score: 8 });
  }

  // 4. Investor not responding
  if (contactsStatus === 'Not Responding') {
    score += 10;
    reasons.push({ rule: 'Investor marked "Not Responding"', score: 10 });
  } else if (contactsStatus === 'Delayed Response') {
    score += 5;
    reasons.push({ rule: 'Investor marked "Delayed Response"', score: 5 });
  }

  // 5. Missing core documents - let's check if we don't have trade licence or LSA agreement
  const hasLic = docs.some(d => d.companyId === company.id && d.documentType === 'Trade Licence');
  const hasLsa = docs.some(d => d.companyId === company.id && d.documentType === 'Local Service Agent Agreement');
  if (!hasLic || !hasLsa) {
    score += 10;
    reasons.push({ rule: 'Missing core compliance documents in Vault', score: 10 });
  }

  // 6. Signature request older than 72 hours
  const pendingSignatures = approvals.filter(req => req.companyId === company.id && (req.status === 'Submitted' || req.status === 'Under Review'));
  let older72h = false;
  pendingSignatures.forEach(s => {
    const createTime = new Date(s.createdAt).getTime();
    if ((now - createTime) / (1000 * 60 * 60 * 24) > 3) {
      older72h = true;
    }
  });
  if (older72h) {
    score += 8;
    reasons.push({ rule: 'Pending signature request older than 72 hours', score: 8 });
  }

  // 7. Offboarding case open
  if (hasOffboarding) {
    score += 15;
    reasons.push({ rule: 'Offboarding/Exit workflow is active', score: 15 });
  }

  // 8. Overdue task
  const overdueTasks = tasks.some(t => t.companyId === company.id && t.status !== 'Completed' && new Date(t.dueDate).getTime() < now);
  if (overdueTasks) {
    score += 8;
    reasons.push({ rule: 'Overdue task or renewal action pending', score: 8 });
  }

  // 9. Manual high-risk flags
  if (company.notes && (company.notes.toLowerCase().includes('risk') || company.notes.toLowerCase().includes('dispute') || company.notes.toLowerCase().includes('citation'))) {
    score += 20;
    reasons.push({ rule: 'LSA manual high-risk note recorded', score: 20 });
  }

  const finalScore = Math.min(100, score);
  return {
    score: finalScore,
    reasons
  };
}
