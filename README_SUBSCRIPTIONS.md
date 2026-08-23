# Subscriptions

How the email list works: signup, confirmation, announcements, unsubscribe.

Storage is the DynamoDB table named by `DYNAMODB_TABLE_SUBSCRIBERS`
(partition key `email`). Delivery is [Resend](https://resend.com), sending as
`JK Cycling <notify@notifications.jkcycling.com>`.

> Earlier revisions of this document described a JSON-file stub, with Supabase
> and AWS SES as the intended production path. Neither was ever built; the
> implementation is DynamoDB + Resend.

## The flow

### 1. Signup — `POST /api/subscribe`

Body: `{ email, name?, district? }`.

Creates a subscriber with `status: 'pending'` and two tokens:

| Field | Lifetime | Purpose |
| --- | --- | --- |
| `token` | Single use, deleted on confirm | The double opt-in link |
| `unsubscribeToken` | Permanent | Unsubscribe links in every bulk email |

Then emails a confirmation link. Re-subscribing an existing address is a no-op
that reports the current state rather than issuing a second record.

### 2. Confirmation — `GET /api/confirm?token=…`

Promotes the subscriber to `confirmed`, records `confirmedAt`, deletes the
single-use `token`, backfills an `unsubscribeToken` if the record predates that
field, sends a welcome email, and redirects to `/?sub_confirmed=1`.

### 3. Announcement — admin action

An admin clicks **Notify** on an upcoming event in `/admin`. That calls
`notifyEventAction`, which loads every `confirmed` subscriber and sends one
email each via `src/lib/announcement.ts`.

It is deliberately a button and not a side effect of saving an event, because
a send cannot be recalled. Two guards prevent duplicates:

- `Event.notifiedAt` is set after a successful run, and the action refuses an
  already-announced event unless `resend` is passed explicitly.
- `buildEventFromForm` carries `notifiedAt` across edits, so editing an event
  cannot re-arm the button.

One send per recipient — each carries a personal unsubscribe link, so this
cannot be a single BCC. Individual failures are collected and reported; they do
not abort the run. The run is capped at `MAX_RECIPIENTS_PER_RUN` (200) and logs
loudly if the list exceeds it. Beyond a few hundred subscribers this needs a
queue or Resend's batch API, since each send is a separate API call inside one
serverless invocation.

### 4. Unsubscribe — `/api/unsubscribe?token=…`

- **`GET` renders a confirmation page and changes nothing.** Mail clients and
  security scanners prefetch links; a state-changing GET would unsubscribe
  people who never clicked.
- **`POST` performs the unsubscribe.** It serves both the page's button and the
  RFC 8058 one-click header, so Gmail and Outlook's native unsubscribe button
  works without ever rendering the page.

The record is kept with `status: 'unsubscribed'` rather than deleted, so a
later re-subscribe does not resurrect stale confirmation state.

Every announcement carries:

```
List-Unsubscribe: <https://jkcycling.com/api/unsubscribe?token=…>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

## Deliverability

`NEXT_PUBLIC_SITE_URL` builds every confirmation and unsubscribe link. If it is
unset they fall back to `https://jkcycling.com`, so local testing points people
at production — set it in `.env.local` and in Vercel.

Keep SPF, DKIM and DMARC configured for the sending domain in Resend. Bulk mail
without working unsubscribe headers gets spam-foldered, which shows up as
signups that never confirm.

## Testing locally

`npm run dev`, then use the form on the home page. In development the
confirmation URL is also logged to the server console, so you can confirm
without opening the email.

Unit tests cover the announcement builder, the send loop, and the unsubscribe
route — including that `GET` stays inert:

```bash
npx vitest run src/lib/announcement.test.ts src/app/api/unsubscribe
```

Note that no automated test sends real email; Resend is mocked throughout.
Verifying live delivery means triggering one send to an address you control.

## Privacy

Subscriber addresses are personal data. Do not commit them, print them in
logs or summaries, or copy them out of DynamoDB.
