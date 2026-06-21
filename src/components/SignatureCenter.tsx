import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { ApprovalRequest } from '../types';
import { dictionary } from '../store/translations';
import { FileSignature, ShieldAlert, Check, AlertTriangle, Fingerprint, Globe } from 'lucide-react';

export const SignatureCenter: React.FC = () => {
  const { currentLanguage, approvalRequests, companies, addApprovalDecision } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [signSuccess, setSignSuccess] = useState(false);

  const pendingRequests = approvalRequests.filter(r => r.status === 'Submitted' || r.status === 'Under Review');
  const pastRequests = approvalRequests.filter(r => r.status === 'Approved' || r.status === 'Rejected');

  const handleConsentSign = () => {
    if (!selectedReq) return;
    if (passcode !== '1234') {
      setPasscodeError('Invalid local workspace digital verification passcode. Use 1234 for development bypass.');
      return;
    }

    setPasscodeError('');
    addApprovalDecision({
      approvalRequestId: selectedReq.id,
      approverId: 'u1',
      decision: 'Approve',
      authenticationMethod: 'Passcode & OTP recorded',
      ipAddress: '194.170.80.201',
      deviceInfo: 'Edge 112 / Emirates Telecom'
    });

    setSignSuccess(true);
    setTimeout(() => {
      setSignSuccess(false);
      setSelectedReq(null);
      setPasscode('');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{t.menuApprovals}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Review, sign, or reject official corporate NOC requests, trade licence amendments, and municipal declarations securely.
        </p>
      </div>

      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-lg text-xs space-y-1">
        <h4 className="font-bold flex items-center space-x-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Fiduciary Consent Framework (Sec 2.F)</span>
        </h4>
        <p>LSA digital signatures are legally binding indicators of administrative consent inside the UAE. Ensure Ejari/tenancy matches actual office parameters before signing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Pending Signings List */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h4 className="font-bold text-slate-950 text-sm">Active Signings Queued ({pendingRequests.length})</h4>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">Requires Action</span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map(req => {
              const comp = companies.find(c => c.id === req.companyId);
              return (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedReq(req)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex justify-between items-center text-xs ${
                    selectedReq?.id === req.id ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-950 block">{req.requestTitle}</span>
                    <span className="text-[10px] text-indigo-600 font-semibold block">{comp ? comp.legalNameEn : 'Archived Corporate'}</span>
                    <span className="text-[10px] text-gray-500 block">Category: {req.requestCategory} | Urgent: {req.riskLevel}</span>
                  </div>

                  <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase text-center block">
                    {req.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Past logs list */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Completed Audit Signs logs</h4>
            
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {pastRequests.map(req => {
                const comp = companies.find(c => c.id === req.companyId);
                return (
                  <div key={req.id} className="p-3 bg-slate-50 border border-gray-50 rounded-lg flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-bold text-slate-700">{req.requestTitle}</span>
                      <span className="text-[10px] text-gray-400 block">{comp?.legalNameEn}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black text-[9px] uppercase">
                      Approved
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Signature Consent Details Form */}
        <div className="lg:col-span-4">
          {selectedReq ? (
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-950 space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-400">Digital Consent Form</span>
                <span className="text-gray-400 cursor-pointer text-sm" onClick={() => setSelectedReq(null)}>✕</span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-extrabold">{selectedReq.requestTitle}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isRtl ? selectedReq.descriptionAr : selectedReq.descriptionEn}
                </p>
              </div>

              {/* Security parameters */}
              <div className="p-3 bg-slate-950 rounded-lg space-y-1.5 text-[10px] border border-slate-800">
                <p className="text-indigo-400 flex items-center space-x-1 font-bold">
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                  <span>Immutable Signatory Stamp info:</span>
                </p>
                <div className="space-y-0.5 text-slate-400">
                  <p>✓ Current User IP: <span className="font-mono text-slate-200">194.170.80.201</span></p>
                  <p>✓ Geo Location: <span className="text-slate-200">Abu Dhabi, UAE</span></p>
                  <p>✓ Certificate Type: <span className="text-slate-200">Local Service Agent Ledger Stamp</span></p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-slate-400 italic text-[10px] mb-3 leading-snug">
                  {t.signDisclaimer}
                </p>

                {signSuccess ? (
                  <div className="p-3 bg-emerald-600 text-white rounded-lg text-center font-bold animate-pulse">
                    ✓ Transaction Signed and Logged successfully!
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Enter Workspace Passcode (1234)</label>
                    <input 
                      type="password"
                      placeholder="Type passcode..."
                      value={passcode}
                      onChange={e => setPasscode(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    {passcodeError && <p className="text-[10px] text-red-400">{passcodeError}</p>}
                    
                    <button 
                      onClick={handleConsentSign}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition"
                    >
                      Authorize Consent Sign
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-xs text-gray-400 space-y-2">
              <FileSignature className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-500">No request selected</p>
              <p>Click any digital signature request card on the left panel to inspect detailed LSA parameters, stamp, location, and apply consent.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
