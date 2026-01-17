# Internal Portfolio & Document Compliance System (Demo)

## Why
Internal regulatory teams lose time when portfolio status lives in spreadsheets and documents live in SharePoint. This demo replaces that fragmentation with a single, auditable workflow.

## What problem it solves
- One source of truth for portfolio readiness.
- Documents move from upload -> pending -> approved with audit trail.
- Market requirements block items until resolved.

## Core decisions
- **State-driven system**: every item and document has explicit statuses.
- **Alerts over dashboards**: highlight blockers and pending approvals.
- **No AI by default**: safer for sensitive regulatory data.
- **Small, operable v1**: minimal scope, real workflow coverage.

## Metrics (conceptual)
- **Time-to-status clarity**: fewer touches to answer "Is this ready?"
- **Blocked items visible at a glance**: risks surface immediately.
- **Reduced manual checks**: audit log replaces scattered approvals.

## What is intentionally missing
- Permissions matrix UI (roles exist, no admin console yet).
- Full workflow engine with SLAs and escalations.
- Advanced AI for classification or risk scoring.

## Demo flow
1. Import CSV to create portfolio items and compliance tasks.
2. Review portfolio list with filters (status/market/owner).
3. Open an item and upload a document (status: pending).
4. Approve the document (Admin) -> audit log entry.
5. Portfolio status updates based on remaining tasks.

## Screenshots
Add real screenshots in `screenshots/`:
- `dashboard.png`
- `portfolio-list.png`
- `import.png`
- `activity-log.png`

## Demo
This is an auth-protected internal tool. The live deployment is provided for UI and flow reference only. See the repository for implementation details.

## Author
Built by **Ivete Amorim**  
GitHub: https://github.com/iveteamorim

## Quick start
```
npm install
npm run dev
```

## Supabase setup
1. Run `db/migrations/001_init.sql`
2. Run `db/migrations/002_seed.sql`
3. Create Auth users for the seeded emails
4. Create Storage bucket `documents` (public) and add policies

Storage policies example:
```sql
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict do nothing;

create policy "documents_read" on storage.objects
for select
using (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "documents_insert" on storage.objects
for insert
with check (bucket_id = 'documents' and auth.role() = 'authenticated');
```
