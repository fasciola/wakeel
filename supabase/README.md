# Wakeel Aman Supabase infrastructure

This folder contains the version-controlled database schema, Row Level Security policies, private Storage rules, immutable audit-log triggers, transparent risk engine, and Edge Functions for Wakeel Aman.

## Deployment order

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy document-signed-url
npx supabase functions deploy create-workspace
npx supabase functions deploy invite-user
npx supabase functions deploy accept-invitation
```

## Local development

```bash
npx supabase start
npx supabase db reset
```

`seed.sql` contains fictional development data only. It must never be used as production customer data.

## Security notes

- `wakeel-documents` is private.
- Browser users cannot create permanent document URLs.
- `document-signed-url` validates access, creates an audit record, and returns a URL valid for five minutes.
- RLS isolates workspaces in the database rather than relying only on the interface.
- `audit_logs` is append-only for authenticated users.
