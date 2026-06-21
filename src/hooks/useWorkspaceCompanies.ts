import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Company } from '../types';

function mapCompany(row: any): Company {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    legalNameEn: row.legal_name_en,
    legalNameAr: row.legal_name_ar ?? '',
    tradeLicenceNumber: row.trade_licence_number,
    emirate: row.emirate as Company['emirate'],
    legalForm: row.legal_form,
    businessActivity: row.business_activity,
    registrationDate: row.registration_date,
    licenceIssueDate: row.licence_issue_date,
    licenceExpiryDate: row.licence_expiry_date,
    companyStatus: row.company_status as Company['companyStatus'],
    riskScore: Number(row.risk_score ?? 0),
    riskLevel: (row.risk_level ?? 'Low') as Company['riskLevel'],
    assignedManagerId: row.assigned_manager_id ?? undefined,
    annualFee: Number(row.annual_fee ?? 0),
    feeCurrency: row.fee_currency ?? 'AED',
    relationshipType: (row.relationship_type ?? 'Local Service Agent') as Company['relationshipType'],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useWorkspaceCompanies(workspaceId: string, refreshKey = 0) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!workspaceId) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('companies')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Unable to load workspace companies:', queryError);
      setError(queryError.message || 'Unable to load companies.');
      setCompanies([]);
    } else {
      setCompanies((data ?? []).map(mapCompany));
    }

    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  const deleteCompany = async (companyId: string) => {
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
      .eq('workspace_id', workspaceId);

    if (deleteError) {
      throw new Error(deleteError.message || 'Unable to archive the company.');
    }

    await reload();
  };

  return { companies, loading, error, reload, deleteCompany };
}
