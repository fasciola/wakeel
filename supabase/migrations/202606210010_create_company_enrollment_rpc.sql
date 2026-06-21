begin;

create or replace function public.create_company_enrollment(
  p_workspace_id uuid,
  p_legal_name_en text,
  p_legal_name_ar text,
  p_trade_licence_number text,
  p_emirate text,
  p_legal_form text,
  p_business_activity text,
  p_registration_date date,
  p_licence_issue_date date,
  p_licence_expiry_date date,
  p_annual_fee numeric,
  p_fee_currency text,
  p_relationship_type text,
  p_investor_name text,
  p_investor_name_ar text,
  p_investor_email text,
  p_investor_phone text,
  p_investor_language text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_contact_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if not public.can_create_company_in_workspace(p_workspace_id) then
    raise exception 'You are not authorised to create companies in this workspace';
  end if;

  if char_length(trim(coalesce(p_legal_name_en, ''))) < 2 then
    raise exception 'Company name is required';
  end if;

  if char_length(trim(coalesce(p_trade_licence_number, ''))) < 2 then
    raise exception 'Trade licence number is required';
  end if;

  if char_length(trim(coalesce(p_investor_name, ''))) < 2 then
    raise exception 'Investor contact name is required';
  end if;

  if char_length(trim(coalesce(p_investor_email, ''))) < 3 then
    raise exception 'Investor contact email is required';
  end if;

  insert into public.companies (
    workspace_id,
    legal_name_en,
    legal_name_ar,
    trade_licence_number,
    emirate,
    legal_form,
    business_activity,
    registration_date,
    licence_issue_date,
    licence_expiry_date,
    company_status,
    risk_score,
    risk_level,
    annual_fee,
    fee_currency,
    relationship_type,
    notes,
    created_by
  ) values (
    p_workspace_id,
    trim(p_legal_name_en),
    trim(coalesce(p_legal_name_ar, '')),
    trim(p_trade_licence_number),
    trim(p_emirate),
    trim(p_legal_form),
    trim(coalesce(p_business_activity, '')),
    p_registration_date,
    p_licence_issue_date,
    p_licence_expiry_date,
    'Active',
    0,
    'Low',
    coalesce(p_annual_fee, 0),
    upper(trim(coalesce(p_fee_currency, 'AED'))),
    trim(coalesce(p_relationship_type, 'Local Service Agent')),
    'Created through the company enrollment wizard.',
    auth.uid()
  )
  returning id into v_company_id;

  insert into public.contacts (
    workspace_id,
    full_name,
    full_name_ar,
    email,
    phone,
    nationality,
    preferred_language,
    relationship_status,
    ref_number
  ) values (
    p_workspace_id,
    trim(p_investor_name),
    nullif(trim(coalesce(p_investor_name_ar, '')), ''),
    lower(trim(p_investor_email)),
    nullif(trim(coalesce(p_investor_phone, '')), ''),
    'Foreign National',
    case
      when p_investor_language in ('en', 'ar') then p_investor_language
      else 'en'
    end,
    'Active',
    'REG-NEW'
  )
  returning id into v_contact_id;

  insert into public.company_contacts (
    company_id,
    contact_id,
    role,
    is_primary
  ) values (
    v_company_id,
    v_contact_id,
    'Investor',
    true
  );

  return v_company_id;
end;
$$;

revoke all on function public.create_company_enrollment(
  uuid, text, text, text, text, text, text, date, date, date,
  numeric, text, text, text, text, text, text, text
) from public;

grant execute on function public.create_company_enrollment(
  uuid, text, text, text, text, text, text, date, date, date,
  numeric, text, text, text, text, text, text, text
) to authenticated;

commit;
