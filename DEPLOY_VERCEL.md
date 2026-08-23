# Deployment

The site is hosted on Vercel and deploys from git. AWS (DynamoDB + S3) and
Resend are provisioned separately and reached with credentials held in Vercel's
environment variables.

## Environment variables

Every key below must exist in the Vercel project for **both** Production and
Preview, and in `.env.local` for development. A missing AWS credential fails
the build outright, because `npm run build` reads the events table while
prerendering.

| Variable | Purpose |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | IAM user with DynamoDB + S3 access |
| `AWS_SECRET_ACCESS_KEY` | " |
| `AWS_REGION` | e.g. `ap-south-1` |
| `DYNAMODB_TABLE_EVENTS` | Events table name |
| `DYNAMODB_TABLE_SUBSCRIBERS` | Subscribers table name |
| `DYNAMODB_TABLE_GROUPS` | Ride groups table name |
| `DYNAMODB_TABLE_AUTH` | Auth.js adapter table |
| `DYNAMODB_TABLE_AUTH_INDEX` | Auth.js adapter GSI |
| `AUTH_SECRET` | Auth.js session encryption |
| `AUTH_GOOGLE_ID` | Google OAuth client |
| `AUTH_GOOGLE_SECRET` | " |
| `ADMIN_EMAILS` | Comma-separated admin allowlist |
| `S3_BUCKET_NAME` | Bucket for posters and PDFs |
| `NEXT_PUBLIC_CLOUDFRONT_DOMAIN` | CDN domain serving that bucket |
| `RESEND_API_KEY` | Transactional email |
| `NEXT_PUBLIC_SITE_URL` | Base URL for confirmation/unsubscribe links |

Two that bite when wrong:

- **`NEXT_PUBLIC_SITE_URL`** — if unset, links fall back to
  `https://jkcycling.com`, so a preview deployment emails people links to
  production.
- **`ADMIN_EMAILS`** — entries are trimmed, so `a@x.com, b@y.com` works, but
  the address must match the Google account exactly.

## Google OAuth

The OAuth client needs an authorised redirect URI per origin that serves
sign-in:

```
https://jkcycling.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

Preview deployments get generated hostnames, so admin sign-in will not work
there unless you add that specific URI too.

## Branches and builds

`vercel.json` sets:

- `git.deploymentEnabled` — deploys enabled for `main`.
- `ignoreCommand` — skips the build only when a commit touches nothing but
  `.md`/`.txt` files. Vercel treats exit code 0 as "skip", so the condition
  looks for any file that is *not* documentation. An earlier version matched
  documentation files instead, which meant any commit touching a `.md`
  alongside code silently skipped the deploy.

**Check the Production branch in the Vercel dashboard.** It has not always
matched what `vercel.json` implies, and a deployment can therefore come from a
different branch than you expect.

## Deploying

Push to the production branch and Vercel builds automatically. To deploy from a
local checkout:

```powershell
npm i -g vercel
vercel login
vercel --prod
```

## After a deploy

1. Load the home page, an event page, and `/results`.
2. Sign in at `/admin` and confirm the dashboard renders — this exercises
   Auth.js, the adapter table, and `ADMIN_EMAILS` together.
3. Upload an image and a PDF from the event form to exercise S3 and CloudFront.
4. Only if you mean to: use **Notify** on a test event to exercise Resend. This
   emails real subscribers, so prefer an event nobody is subscribed to, or an
   address you control.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Build fails while prerendering | Missing or wrong AWS credentials; the build reads DynamoDB |
| `/groups` renders empty with a warning in the log | `DYNAMODB_TABLE_GROUPS` unset, or the table does not exist. Reads degrade to an empty directory by design; writes will fail |
| Push produced no deployment | `ignoreCommand` skipped it, or the Production branch is not the one you pushed |
| Signed in but "Access Denied" at `/admin` | Address absent from `ADMIN_EMAILS` |
| Sign-in redirect error | Redirect URI not registered for that origin |
| Data changes not visible | Cache: writes must call `revalidateTag('events', 'default')`; reads revalidate hourly |
| Uploads fail with 415 | `/api/upload` only presigns images and PDFs |
| Emails not arriving | `RESEND_API_KEY`, or the sending domain's DNS in Resend |
