Subscription feature (stub) — local dev notes

Overview

- This project includes a simple, local stub for email subscriptions to allow testing without external services.
- The stub stores subscribers in `src/data/subscribers.json` and implements a double-opt-in confirmation flow using two API routes:
  - `POST /api/subscribe` — accepts `{ email, name?, district? }`, stores a pending subscriber and returns a `confirmUrl` (dev only).
  - `GET /api/confirm?token=...` — marks the subscriber as confirmed and redirects to `/?sub_confirmed=1`.

Purpose

- The stub lets you test the UI and flow before creating a Supabase project and configuring AWS SES.
- After you verify the UI, you can replace the stub with Supabase and SES using the TODOs below.

How to test locally

1. Start the dev server:

```powershell
npm run dev
```

2. Open `http://localhost:3000` and use the subscription form near the bottom of the homepage.
3. The API returns a `confirmUrl` in the response (and logs it to server console). Copy/open that URL to confirm the subscription.
4. Check `src/data/subscribers.json` to see the `pending` -> `confirmed` status change.

Replacing the stub with Supabase + AWS SES (next steps)

1. Create a Supabase project and add the following SQL to create the `subscribers` table:

```sql
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  district text,
  status text not null default 'pending',
  token text,
  created_at timestamptz default now(),
  confirmed_at timestamptz
);
```

2. Configure AWS SES for `jkcycling.com`:
   - Verify domain and update DNS records for SES & DKIM.
   - Create SMTP credentials or an IAM user for SES SendEmail.

3. Add these environment variables in Vercel (or your local `.env` for dev):

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server-side key)
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- SES_REGION
- SES_FROM_EMAIL (e.g. no-reply@jkcycling.com)
- NEXT_PUBLIC_SITE_URL (for confirmation URL generation)

4. Replace `src/app/api/subscribe/route.ts` and `src/app/api/confirm/route.ts` logic to talk to Supabase (insert rows and update status) and call SES to send confirmation emails.

Delivery

- If you want I can implement the Supabase + SES wiring once you create the Supabase project and provide permission to add secrets.

Security & deliverability notes

- Use double opt-in and include unsubscribe link in all emails.
- Configure DKIM/SPF via SES to improve deliverability.
- For sending to large lists (50k), use batching and monitor SES sending quotas.
