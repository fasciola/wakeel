-- Transparent server-side risk engine. Risk reasons are materialised as risk_events.

create or replace function public.record_risk_event(
  p_workspace_id uuid,
  p_company_id uuid,
  p_key text,
  p_score integer,
  p_en text,
  p_ar text,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_active then
    insert into public.risk_events (
      workspace_id, company_id, risk_rule_key, score_change,
      explanation_en, explanation_ar, status, created_at, resolved_at
    ) values (
      p_workspace_id, p_company_id, p_key, p_score,
      p_en, p_ar, 'Active', now(), null
    )
    on conflict (company_id, risk_rule_key) do update set
      score_change = excluded.score_change,
      explanation_en = excluded.explanation_en,
      explanation_ar = excluded.explanation_ar,
      status = 'Active',
      resolved_at = null;
  else
    update public.risk_events
    set status = 'Resolved', resolved_at = now()
    where company_id = p_company_id
      and risk_rule_key = p_key
      and status = 'Active';
  end if;
end;
$$;

create or replace function public.recalculate_company_risk(p_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company public.companies;
  v_score integer := 0;
  v_active boolean;
  v_level public.risk_level;
begin
  select * into v_company from public.companies where id = p_company_id;
  if not found then return; end if;

  -- 1. Licence expired +35
  v_active := v_company.licence_expiry_date is not null and v_company.licence_expiry_date < current_date;
  if v_active then v_score := v_score + 35; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'LICENCE_EXPIRED', 35,
    'Trade licence is expired.', 'الرخصة التجارية منتهية.', v_active);

  -- 2. Licence expires within 30 days +20 (only if not already expired)
  v_active := v_company.licence_expiry_date is not null
    and v_company.licence_expiry_date between current_date and current_date + 30;
  if v_active then v_score := v_score + 20; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'LICENCE_EXPIRING_30_DAYS', 20,
    'Trade licence expires within 30 days.', 'ستنتهي الرخصة التجارية خلال 30 يوماً.', v_active);

  -- 3. Service-agent agreement expired +25
  v_active := exists (
    select 1 from public.company_relationships cr
    where cr.company_id = v_company.id
      and cr.agreement_end_date is not null
      and cr.agreement_end_date < current_date
  );
  if v_active then v_score := v_score + 25; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'AGREEMENT_EXPIRED', 25,
    'A service-agent or relationship agreement is expired.', 'انتهت اتفاقية وكيل الخدمات أو اتفاقية العلاقة.', v_active);

  -- 4. Invoice overdue for more than 30 days +15
  v_active := exists (
    select 1 from public.invoices i
    where i.company_id = v_company.id
      and i.payment_status not in ('Paid','Cancelled','Written Off')
      and i.due_date is not null
      and i.due_date < current_date - 30
  );
  if v_active then v_score := v_score + 15; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'FEE_OVERDUE_30_DAYS', 15,
    'A company invoice is overdue by more than 30 days.', 'فاتورة الشركة متأخرة لأكثر من 30 يوماً.', v_active);

  -- 5. Investor not responding or stale relationship contact +10
  v_active := exists (
    select 1
    from public.company_contacts cc
    join public.contacts ct on ct.id = cc.contact_id
    where cc.company_id = v_company.id
      and cc.is_primary = true
      and (
        ct.relationship_status = 'Not Responding'
        or (ct.last_contact_date is not null and ct.last_contact_date < current_date - 14)
      )
  );
  if v_active then v_score := v_score + 10; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'INVESTOR_UNRESPONSIVE', 10,
    'The primary investor/contact is not responding or has not been contacted for more than 14 days.',
    'المستثمر أو جهة الاتصال الرئيسية لا تستجيب أو لم يتم التواصل معها لأكثر من 14 يوماً.', v_active);

  -- 6. Missing core document +10
  v_active := not exists (
    select 1 from public.documents d
    where d.company_id = v_company.id
      and d.is_archived = false
      and lower(d.document_type) in ('trade licence','trade license','الرخصة التجارية')
  );
  if v_active then v_score := v_score + 10; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'MISSING_CORE_DOCUMENT', 10,
    'No current trade-licence document is stored in the document vault.',
    'لا توجد نسخة حالية من الرخصة التجارية في خزنة المستندات.', v_active);

  -- 7. Approval pending more than 72 hours +8
  v_active := exists (
    select 1 from public.approval_requests ar
    where ar.company_id = v_company.id
      and ar.status in ('Submitted','Under Review','Needs More Information')
      and ar.created_at < now() - interval '72 hours'
  );
  if v_active then v_score := v_score + 8; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'APPROVAL_PENDING_72_HOURS', 8,
    'A digital approval record has been pending for more than 72 hours.',
    'يوجد سجل موافقة رقمي معلق لأكثر من 72 ساعة.', v_active);

  -- 8. Open offboarding case +15
  v_active := exists (
    select 1 from public.offboarding_cases oc
    where oc.company_id = v_company.id
      and oc.status not in ('Completed','Closed Without Completion')
  );
  if v_active then v_score := v_score + 15; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'OFFBOARDING_OPEN', 15,
    'An offboarding or agent-exit case is open.', 'توجد حالة خروج أو إنهاء علاقة وكيل مفتوحة.', v_active);

  -- 9. Overdue compliance task +8
  v_active := exists (
    select 1 from public.tasks t
    where t.company_id = v_company.id
      and t.status not in ('Completed','Cancelled')
      and t.due_date is not null
      and t.due_date < current_date
  );
  if v_active then v_score := v_score + 8; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'TASK_OVERDUE', 8,
    'At least one compliance task is overdue.', 'توجد مهمة امتثال واحدة على الأقل متأخرة.', v_active);

  -- 10. Manual high-risk flag +20
  v_active := v_company.manual_risk_flag;
  if v_active then v_score := v_score + 20; end if;
  perform public.record_risk_event(v_company.workspace_id, v_company.id, 'MANUAL_HIGH_RISK', 20,
    'A manual high-risk flag was applied by an authorised user.', 'تم تطبيق علامة مخاطر عالية يدوياً من مستخدم مخول.', v_active);

  v_score := least(100, greatest(0, v_score));
  v_level := case
    when v_score >= 80 then 'Critical'::public.risk_level
    when v_score >= 60 then 'High'::public.risk_level
    when v_score >= 30 then 'Moderate'::public.risk_level
    else 'Low'::public.risk_level
  end;

  update public.companies
  set risk_score = v_score,
      risk_level = v_level,
      updated_at = now()
  where id = v_company.id;
end;
$$;

create or replace function public.recalculate_risk_from_company_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recalculate_company_risk(coalesce(new.id, old.id));
  return coalesce(new, old);
end;
$$;

create or replace function public.recalculate_risk_from_company_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recalculate_company_risk(coalesce(new.company_id, old.company_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.recalculate_risk_from_invoice_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_company_id uuid;
begin
  select company_id into v_company_id from public.invoices where id = coalesce(new.invoice_id, old.invoice_id);
  if v_company_id is not null then perform public.recalculate_company_risk(v_company_id); end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.recalculate_risk_from_contact_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'company_contacts' then
    perform public.recalculate_company_risk(coalesce(new.company_id, old.company_id));
  else
    perform public.recalculate_company_risk(cc.company_id)
    from public.company_contacts cc where cc.contact_id = coalesce(new.id, old.id);
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.recalculate_risk_from_checklist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_company_id uuid;
begin
  select company_id into v_company_id from public.offboarding_cases where id = coalesce(new.offboarding_case_id, old.offboarding_case_id);
  if v_company_id is not null then perform public.recalculate_company_risk(v_company_id); end if;
  return coalesce(new, old);
end;
$$;

-- Fire after writes so all related rows exist before calculation.
create trigger risk_company after insert or update of licence_expiry_date, manual_risk_flag, company_status on public.companies for each row execute function public.recalculate_risk_from_company_row();
create trigger risk_relationship after insert or update or delete on public.company_relationships for each row execute function public.recalculate_risk_from_company_id();
create trigger risk_document after insert or update or delete on public.documents for each row execute function public.recalculate_risk_from_company_id();
create trigger risk_approval after insert or update or delete on public.approval_requests for each row execute function public.recalculate_risk_from_company_id();
create trigger risk_invoice after insert or update or delete on public.invoices for each row execute function public.recalculate_risk_from_company_id();
create trigger risk_invoice_item after insert or update or delete on public.invoice_items for each row execute function public.recalculate_risk_from_invoice_item();
create trigger risk_payment after insert or update or delete on public.payments for each row execute function public.recalculate_risk_from_invoice_item();
create trigger risk_task after insert or update or delete on public.tasks for each row execute function public.recalculate_risk_from_company_id();
create trigger risk_offboarding after insert or update or delete on public.offboarding_cases for each row execute function public.recalculate_risk_from_company_id();
create trigger risk_checklist after insert or update or delete on public.offboarding_checklist_items for each row execute function public.recalculate_risk_from_checklist();
create trigger risk_company_contact after insert or update or delete on public.company_contacts for each row execute function public.recalculate_risk_from_contact_link();
create trigger risk_contact after update of relationship_status, last_contact_date on public.contacts for each row execute function public.recalculate_risk_from_contact_link();
