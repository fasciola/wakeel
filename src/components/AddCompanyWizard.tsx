import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { Company, Contact } from '../types';
import { dictionary } from '../store/translations';
import { Plus, Check, ChevronRight, ChevronLeft, Upload, ShieldAlert, FileText, UserCheck } from 'lucide-react';

interface WizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCompanyWizard: React.FC<WizardProps> = ({ onClose, onSuccess }) => {
  const { currentLanguage, addCompany, addContact, addDocument } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    // Step 1: Identity
    legalNameEn: '',
    legalNameAr: '',
    tradeLicenceNumber: '',
    emirate: 'Dubai' as Company['emirate'],
    legalForm: 'LLC',
    businessActivity: 'General Trading',
    
    // Step 2: Relationship
    relationshipType: 'Local Service Agent' as Company['relationshipType'],
    annualFee: 15000,
    feeCurrency: 'AED',
    agreementStartDate: '2026-06-20',
    agreementEndDate: '2027-06-19',
    
    // Step 3: Investor Contact
    investorName: '',
    investorEmail: '',
    investorPhone: '',
    investorLang: 'en' as 'en' | 'ar',
    
    // Step 4: Files (Simulations)
    tradeLicenceFile: null as File | null | string,
    agreementFile: null as File | null | string,
    
    // Step 5: Compliance Dates
    licenceExpiryDate: '2027-06-19',
    reminderSchedule: 30
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.legalNameEn) newErrors.legalNameEn = 'English commercial name is required';
      if (!formData.legalNameAr) newErrors.legalNameAr = 'Arabic commercial name is required';
      if (!formData.tradeLicenceNumber) newErrors.tradeLicenceNumber = 'Trade License number is required';
    } else if (step === 3) {
      if (!formData.investorName) newErrors.investorName = 'Investor contact name is required';
      if (!formData.investorEmail) newErrors.investorEmail = 'Active email address is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFormSubmit = () => {
    if (!validateStep()) return;

    // 1. Submit Contact record
    const contactId = addContact({
      fullName: formData.investorName,
      fullNameAr: formData.investorLang === 'ar' ? formData.investorName : undefined,
      email: formData.investorEmail,
      phone: formData.investorPhone,
      nationality: 'Foreign National',
      preferredLanguage: formData.investorLang,
      relationshipStatus: 'Active',
      refNumber: 'REG-NEW'
    });

    // 2. Submit Company record
    const companyId = addCompany({
      legalNameEn: formData.legalNameEn,
      legalNameAr: formData.legalNameAr,
      tradeLicenceNumber: formData.tradeLicenceNumber,
      emirate: formData.emirate,
      legalForm: formData.legalForm,
      businessActivity: formData.businessActivity,
      registrationDate: formData.agreementStartDate,
      licenceIssueDate: formData.agreementStartDate,
      licenceExpiryDate: formData.licenceExpiryDate,
      companyStatus: 'Active',
      annualFee: Number(formData.annualFee),
      feeCurrency: formData.feeCurrency,
      relationshipType: formData.relationshipType,
      notes: 'Initial wizard enrollment portfolio.'
    });

    // 3. Upload simulated Trade Licence Doc
    addDocument({
      companyId,
      documentType: 'Trade Licence',
      title: `Trade Licence copy - ${formData.tradeLicenceNumber}`,
      filePath: `/vault/w1/${companyId}/trade_license_wizard.pdf`,
      mimeType: 'application/pdf',
      fileSize: 450,
      issueDate: formData.agreementStartDate,
      expiryDate: formData.licenceExpiryDate,
      verificationStatus: 'Pending Review',
      uploadedBy: 'u1',
      notes: 'Onboarded via enrollment wizard.'
    });

    // 4. Upload simulated LSA Agreement Doc
    addDocument({
      companyId,
      documentType: 'Local Service Agent Agreement',
      title: `LSA Agreement - Partner Signed Copy`,
      filePath: `/vault/w1/${companyId}/lsa_agreement_wizard.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1100,
      issueDate: formData.agreementStartDate,
      expiryDate: formData.agreementEndDate,
      verificationStatus: 'Verified',
      uploadedBy: 'u1',
      notes: 'LSA legal agreement validated by Owner.'
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-gray-800" id="wizard_outer">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{t.newCompanyWizardBtn}</h3>
            <p className="text-xs text-slate-300 mt-1">
              {isRtl ? 'بوابة تسجيل وإثبات المنشآت التجارية لدولة الإمارات' : 'Official Guided Onboarding for UAE Corporate Entities'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-sm px-3 py-1 bg-slate-800 rounded-lg"
          >
            ❌
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center text-xs font-medium text-gray-500 overflow-x-auto">
          {[
            { n: 1, l: isRtl ? 'المنشأة' : 'Entity Identity' },
            { n: 2, l: isRtl ? 'عقد الخدمات' : 'LSA Fee' },
            { n: 3, l: isRtl ? 'المستثمر' : 'Investor' },
            { n: 4, l: isRtl ? 'الملفات' : 'Uploads' },
            { n: 5, l: isRtl ? 'الامتثال' : 'Expiries' },
            { n: 6, l: isRtl ? 'المراجعة' : 'Audit Link' }
          ].map(s => (
            <div key={s.n} className="flex items-center space-x-1 min-w-[50px] mx-1">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.n ? 'bg-indigo-600 text-white font-bold' : step > s.n ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {step > s.n ? '✓' : s.n}
              </span>
              <span className={step === s.n ? 'text-indigo-600 font-bold' : ''}>{s.l}</span>
              {s.n < 6 && <span className="text-gray-300 px-1">›</span>}
            </div>
          ))}
        </div>

        {/* Content Box */}
        <div className="flex-1 p-6 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 mb-2">{isRtl ? 'الخطوة 1: الهوية والمظاهر القانونية للمنشأة' : 'Step 1: Corporate Entity Identity'}</h4>
              
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Company legal name (English) *</label>
                <input 
                  type="text"
                  placeholder="e.g. Amber Logistics LLC"
                  value={formData.legalNameEn}
                  onChange={e => setFormData(p => ({ ...p, legalNameEn: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-600 ${errors.legalNameEn ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.legalNameEn && <span className="text-[10px] text-red-500 block mt-1">{errors.legalNameEn}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">اسم المنشأة التجاري (بالعربية) *</label>
                <input 
                  type="text"
                  placeholder="مثال: المها للدعم اللوجستي ذ.م.م"
                  value={formData.legalNameAr}
                  onChange={e => setFormData(p => ({ ...p, legalNameAr: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm bg-white text-right focus:ring-1 focus:ring-indigo-600 ${errors.legalNameAr ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.legalNameAr && <span className="text-[10px] text-red-500 block mt-1">{errors.legalNameAr}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Trade license number *</label>
                  <input 
                    type="text"
                    placeholder="e.g. TL-29102"
                    value={formData.tradeLicenceNumber}
                    onChange={e => setFormData(p => ({ ...p, tradeLicenceNumber: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-600"
                  />
                  {errors.tradeLicenceNumber && <span className="text-[10px] text-red-500 block mt-1">{errors.tradeLicenceNumber}</span>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Emirate of registration</label>
                  <select 
                    value={formData.emirate}
                    onChange={e => setFormData(p => ({ ...p, emirate: e.target.value as Company['emirate'] }))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-600"
                  >
                    {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Legal structure form</label>
                  <input 
                    type="text"
                    placeholder="e.g. LLC / Sole Establishment"
                    value={formData.legalForm}
                    onChange={e => setFormData(p => ({ ...p, legalForm: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Business activity details</label>
                  <input 
                    type="text"
                    placeholder="e.g. Tech Consulting & Cloud Systems"
                    value={formData.businessActivity}
                    onChange={e => setFormData(p => ({ ...p, businessActivity: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 mb-2">{isRtl ? 'الخطوة 2: اتفاقية الخدمات وتحديد الرسوم السنوية' : 'Step 2: LSA Agreement & Annual Fiduciary Fee'}</h4>
              
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Relationship sponsorship category</label>
                <select 
                  value={formData.relationshipType}
                  onChange={e => setFormData(p => ({ ...p, relationshipType: e.target.value as Company['relationshipType'] }))}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="Local Service Agent">Local Service Agent (LSA)</option>
                  <option value="Nominee Shareholder">Nominee Shareholder / Partner</option>
                  <option value="Local Partner">Local Partner (51/49 setup)</option>
                  <option value="Authorised Signatory">Authorised Signatory Representative</option>
                  <option value="Consultant">PRO Consultant</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Annual Fee amount (AED)</label>
                  <input 
                    type="number"
                    value={formData.annualFee}
                    onChange={e => setFormData(p => ({ ...p, annualFee: Number(e.target.value) }))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Currency</label>
                  <input 
                    type="text" 
                    value={formData.feeCurrency} 
                    disabled 
                    className="w-full p-2 border border-gray-100 bg-gray-50 rounded-lg text-sm text-gray-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Agreement Start Date</label>
                  <input 
                    type="date"
                    value={formData.agreementStartDate}
                    onChange={e => setFormData(p => ({ ...p, agreementStartDate: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Agreement End Date</label>
                  <input 
                    type="date"
                    value={formData.agreementEndDate}
                    onChange={e => setFormData(p => ({ ...p, agreementEndDate: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 mb-2">{isRtl ? 'الخطوة 3: معلومات المستثمر ووسائل التواصل المعتمدة' : 'Step 3: Primary Investor Contact Details'}</h4>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name of Investor *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">👤</span>
                  <input 
                    type="text"
                    placeholder="e.g. Dr. John Carter"
                    value={formData.investorName}
                    onChange={e => setFormData(p => ({ ...p, investorName: e.target.value }))}
                    className={`w-full p-2 pl-9 border rounded-lg text-sm bg-white ${errors.investorName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  />
                </div>
                {errors.investorName && <span className="text-[10px] text-red-500 block mt-1">{errors.investorName}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Email address *</label>
                  <input 
                    type="email"
                    placeholder="john@carterholdings.com"
                    value={formData.investorEmail}
                    onChange={e => setFormData(p => ({ ...p, investorEmail: e.target.value }))}
                    className={`w-full p-2 border rounded-lg text-sm bg-white ${errors.investorEmail ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.investorEmail && <span className="text-[10px] text-red-500 block mt-1">{errors.investorEmail}</span>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Mobile / WhatsApp No</label>
                  <input 
                    type="text"
                    placeholder="e.g. +971 50 111 2222"
                    value={formData.investorPhone}
                    onChange={e => setFormData(p => ({ ...p, investorPhone: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Preferred language for reminders</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center text-sm font-medium">
                    <input 
                      type="radio" 
                      name="investorLang" 
                      checked={formData.investorLang === 'en'}
                      onChange={() => setFormData(p => ({ ...p, investorLang: 'en' }))}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    English (LTR)
                  </label>
                  <label className="flex items-center text-sm font-medium mr-4">
                    <input 
                      type="radio" 
                      name="investorLang" 
                      checked={formData.investorLang === 'ar'}
                      onChange={() => setFormData(p => ({ ...p, investorLang: 'ar' }))}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    العربية (RTL)
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 mb-2">{isRtl ? 'الخطوة 4: تحميل المستندات الإلزامية والاتفاق الموقّع' : 'Step 4: Secure Upload of Mandatory Compliance Files'}</h4>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50 hover:bg-indigo-50/20 transition cursor-pointer">
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm font-semibold">{isRtl ? 'تحميل وثيقة الرخصة التجارية المعتمدة' : 'Drag or click to choose Trade Licence PDF'}</p>
                <p className="text-[10px] text-gray-500 mt-1">Official municipal issuance (PDF up to 10MB)</p>
                <div className="mt-3 inline-block bg-white border border-gray-200 px-3 py-1 rounded text-xs text-indigo-600 font-bold hover:bg-gray-50">
                  {formData.tradeLicenceNumber ? `✓ License_simulation_${formData.tradeLicenceNumber}.pdf` : 'Select File'}
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50 hover:bg-indigo-50/20 transition cursor-pointer">
                <Upload className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold">{isRtl ? 'تحميل اتفاقية وكيل الخدمات الموقعة' : 'Drag or click to choose Local Service Agent Agreement'}</p>
                <p className="text-[10px] text-gray-500 mt-1">Notarized LSA agreement scan copy</p>
                <div className="mt-3 inline-block bg-white border border-gray-200 px-3 py-1 rounded text-xs text-emerald-600 font-bold hover:bg-gray-50">
                  {formData.tradeLicenceNumber ? `✓ LSA_Agreement_Signed_${formData.tradeLicenceNumber}.pdf` : 'Select File'}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 mb-2">{isRtl ? 'الخطوة 5: تاريخ انتهاء الرخصة وجدولة الإخطارات' : 'Step 5: Licence Expiry & Automated Notification Timelines'}</h4>
              
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Official Trade Licence Expiries Date *</label>
                <input 
                  type="date"
                  value={formData.licenceExpiryDate}
                  onChange={e => setFormData(p => ({ ...p, licenceExpiryDate: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">First Automated Email/WhatsApp warning threshold</label>
                <select 
                  value={formData.reminderSchedule}
                  onChange={e => setFormData(p => ({ ...p, reminderSchedule: Number(e.target.value) }))}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="90">90 Days prior (Recommended for Freezones)</option>
                  <option value="60">60 Days prior</option>
                  <option value="30">30 Days prior</option>
                  <option value="14">14 Days prior (Urgent priority dispatch)</option>
                </select>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 flex items-start space-x-3 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p>
                  {isRtl 
                    ? 'سيقوم النظام بجدولة تذكيرات تلقائية عبر البريد الإلكتروني والواتساب في الوقت المحدد. يرجى مراجعة تفعيل الأرقام.' 
                    : 'Wakeel automatic expiry checker engine will schedule alerts to ensure zero government lock-outs. Inactive intervals trigger safety notifications to the LSA desk.'}
                </p>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 mb-2">{isRtl ? 'الخطوة 6: مراجعة المستندات وترسيم مؤشر الخطر الأساسي' : 'Step 6: Pre-Onboarding Audit & Initial Risk Prediction'}</h4>
              
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Company Name:</span>
                  <span className="font-bold">{formData.legalNameEn}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Trade License:</span>
                  <span className="font-mono">{formData.tradeLicenceNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Emirate Office:</span>
                  <span>{formData.emirate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Sponsorship Type:</span>
                  <span className="text-indigo-400 font-semibold">{formData.relationshipType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Billing details:</span>
                  <span className="text-emerald-400 font-bold">{formData.annualFee} {formData.feeCurrency} / Annum</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Primary Partner:</span>
                  <span>{formData.investorName} ({formData.investorEmail})</span>
                </div>
              </div>

              {/* Instant pre-onboarding calculation risk rating */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-emerald-800">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-sm block">Initial Risk Prediction: Low Risk</span>
                    <span className="text-[10px]">All mandatory files uploaded, valid license schedule (&gt;300 days).</span>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black">0 / 100</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-6 bg-slate-50 border-t border-gray-100 flex justify-between items-center" dir={isRtl ? 'rtl' : 'ltr'}>
          {step > 1 ? (
            <button 
              onClick={handleBack}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 transition flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1 ml-1" />
              {t.back}
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 transition"
            >
              {t.cancel}
            </button>
          )}

          {step < 6 ? (
            <button 
              onClick={handleNext}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition flex items-center"
            >
              {t.next}
              <ChevronRight className="w-4 h-4 ml-1 mr-1" />
            </button>
          ) : (
            <button 
              onClick={handleFormSubmit}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition flex items-center"
            >
              <Check className="w-4 h-4 mr-1 ml-1" />
              {isRtl ? 'تأكيد وترسيم الملف' : 'Enroll and Activate'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
