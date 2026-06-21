import { supabase } from './supabase';

export interface AuditPayload {
  workspace_id: string;
  entity_type: string;
  entity_id?: string;
  action: string;
  source?: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
}

// Write client-side audited records securely
export async function createAuditEvent(payload: AuditPayload): Promise<void> {
  try {
    const sessionResult = await supabase.auth.getSession();
    const actorUserId = sessionResult.data.session?.user?.id || null;

    // Redact highly private variables (passwords, banking identifiers)
    const sanitizedOld = redactSensitiveData(payload.old_values);
    const sanitizedNew = redactSensitiveData(payload.new_values);

    const auditEntry = {
      workspace_id: payload.workspace_id,
      actor_user_id: actorUserId,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id || null,
      action: payload.action,
      source: payload.source || 'client',
      old_values: sanitizedOld,
      new_values: sanitizedNew,
      metadata: payload.metadata || {},
      ip_address: payload.ip_address || null,
      user_agent: payload.user_agent || navigator.userAgent,
      request_id: payload.request_id || crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    // Attempt writing to DB
    await supabase.from('audit_logs').insert(auditEntry);
  } catch (err) {
    console.warn('Failed writing audit log to ledger:', err);
  }
}

// Redact keys carrying private setup metrics
function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = { ...obj };
  const sensitiveKeys = ['password', 'token', 'passcode', 'bank_key', 'iban', 'pin', 'otp'];
  
  Object.keys(clone).forEach(key => {
    const lk = key.toLowerCase();
    if (sensitiveKeys.some(sk => lk.includes(sk))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = redactSensitiveData(clone[key]);
    }
  });

  return clone;
}
