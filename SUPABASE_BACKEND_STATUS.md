# Wakeel Aman Supabase backend status

## Included in this delivery

- Version-controlled Supabase schema migrations.
- Auth profile trigger and protected workspace/invitation RPC procedures.
- Row Level Security policies for workspace isolation.
- Private `wakeel-documents` Storage bucket and upload policy.
- Immutable audit-log database triggers and a sensitive-event RPC.
- Transparent PostgreSQL risk engine with materialised reasons.
- Edge Functions for workspace creation, invitations, invitation acceptance, and audited five-minute document links.
- Fictional development seed data.

## Still required before real customer data

The current React client must be refactored to remove its mock `localStorage` client, hard-coded `w1` workspace identifiers, static role selector, simulated signed URL flow, and direct client audit writes. This infrastructure is now ready for that application-layer change.

Do not run this system with real client data until the frontend refactor and RLS tests are complete.
