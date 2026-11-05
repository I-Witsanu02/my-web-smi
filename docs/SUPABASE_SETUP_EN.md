# Supabase Setup and Integration Boundary (English)

## Current state

The Supabase project has been linked and provisioned with the initial `profiles`, `cases`, `case_assets`, `predictions`, and `feedback` tables, row-level security, and a private `rsna-private` bucket. The project currently has no Auth users. The web application still authenticates through the local FastAPI service and stores case data locally. It does not currently call Supabase Auth, the Data API, or Storage. A configured project is not the same as an integrated application.

## Recommended data boundary

For the approved RSNA research workflow, cloud storage may contain:

- Account identity and role needed for access control.
- De-identified case metadata and an opaque case identifier.
- Model identifier, checkpoint SHA-256, prediction value/unit, timestamp, preprocessing settings, ROI review state, and request identifier.
- Expert feedback as a separate record with reviewer, method, status, and audit timestamps.
- RSNA image objects in a private bucket, only when the dataset terms and project permissions allow it.

Do not upload Thai patient data or other real clinical images without institutional approval and an explicit data-governance decision. Do not store passwords, service-role keys, unnecessary direct identifiers, or images in public buckets. Define retention, export, deletion, and backup procedures before enabling real use.

## Before enabling application integration

1. Confirm the project URL and publishable key in the Supabase dashboard. A publishable key may be used by a browser only when every exposed table and Storage path has correct RLS/policies. Never use a secret or service-role key in frontend code.
2. Create individual Auth accounts and assign roles through a trusted administrative process; never trust user-editable metadata for authorization.
3. Review migrations and policies in `supabase/migrations/`. Confirm that each table policy restricts rows to the authenticated owner or an explicitly authorized reviewer, and that Storage paths follow the same ownership rule.
4. Add the pinned `@supabase/supabase-js` dependency and a disabled-by-default client configuration. Keep the local backend as the default until sign-in, data sync, image access, logout, and deletion have passed integration tests.
5. Test with synthetic data first. Verify unauthenticated access is denied, one account cannot read another account's cases/assets, signed URLs expire, and deletion removes both metadata and image objects.
6. Enable cloud persistence only after the project owner approves retention, backup, incident response, and access policies.

## What is not implemented yet

- Supabase sign-up/sign-in/session refresh in the web UI.
- Synchronization of cases, predictions, and feedback from FastAPI/local SQLite/JSON into Supabase.
- Private Storage upload/download from the application.
- Admin role management and account recovery.
- End-to-end tests of RLS from real user sessions.

Until these are completed, use the application locally and do not describe Supabase as the application's active data store. Feedback is not automatically used for training. Model updates should be curated, trained offline, evaluated on a predeclared dataset, and released as a versioned checkpoint after human approval.
