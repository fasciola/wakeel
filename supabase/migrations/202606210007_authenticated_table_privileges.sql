-- Authenticated browser requests need PostgreSQL table privileges.
-- Row Level Security policies still decide exactly which rows/actions are allowed.

grant usage on schema public to authenticated;

grant select, insert, update, delete
on all tables in schema public
to authenticated;

grant usage, select
on all sequences in schema public
to authenticated;

-- Preserve the audit-log append-only rule.
revoke insert, update, delete
on table public.audit_logs
from authenticated;

-- Only authenticated users may invoke these user-facing SECURITY DEFINER RPCs.
revoke execute on function public.create_workspace_for_current_user(
text,
text,
text,
public.workspace_plan
) from public;

grant execute on function public.create_workspace_for_current_user(
text,
text,
text,
public.workspace_plan
) to authenticated;

revoke execute on function public.create_workspace_invitation(
uuid,
text,
public.workspace_role,
jsonb
) from public;

grant execute on function public.create_workspace_invitation(
uuid,
text,
public.workspace_role,
jsonb
) to authenticated;

revoke execute on function public.accept_workspace_invitation(text)
from public;

grant execute on function public.accept_workspace_invitation(text)
to authenticated;
