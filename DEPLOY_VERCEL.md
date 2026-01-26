Deploying the JK Cycling site to Vercel

This document covers quick steps to get the site live on Vercel and how to configure environment variables and a custom domain.

Prerequisites

- Git repository for this project. If your code is local only, push it to GitHub first.
- A Vercel account (free tier is sufficient for this site).
- (Optional) Domain (e.g., jkcycling.com) and access to its DNS.

1) Push repository to GitHub

If you haven't already pushed this repository to GitHub, do this first. From PowerShell in `D:\jkcycling`:

```powershell
git init
git add .
git commit -m "initial jkcycling site"
# replace <owner>/<repo> with your GitHub repo
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

2) Connect repository to Vercel (recommended)

- Go to https://vercel.com and sign in with GitHub.
- Click "New Project" -> "Import Git Repository" and pick your repo.
- For Framework Preset, Vercel should detect "Next.js" automatically.
- Leave build settings as defaults (Vercel will run `npm run build` and `npm start` as needed).

3) Add environment variables in Vercel

Open the project settings in Vercel and add any required environment variables. At minimum, set:

- NEXT_PUBLIC_SITE_URL = https://your-deployed-url.vercel.app (or your domain)

If you plan to wire production subscriptions (Supabase + AWS SES) later, add these as well:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- SES_REGION
- SES_FROM_EMAIL
- NEXTAUTH_SECRET (if using NextAuth)
- GITHUB_OAUTH_CLIENT_ID (if enabling GitHub OAuth admin)
- GITHUB_OAUTH_CLIENT_SECRET
- GITHUB_ADMIN_PAT (server token used to create PRs)

Make sure you add sensitive keys to the "Environment Variables" section (not the CLI logs).

4) Deploy

Once connected, Vercel will automatically create a preview deployment for your default branch. Merge/push will create subsequent preview/production deployments.

You can also deploy from your local machine using the Vercel CLI:

```powershell
npm i -g vercel
vercel login
cd D:\jkcycling
vercel --prod
```

5) Configure a custom domain (optional)

- In the Vercel project, go to Domains and add `jkcycling.com`.
- Follow the DNS instructions Vercel shows (usually add A/ALIAS or CNAME records and verify).
- Add the domain to Vercel and wait for DNS propagation.

6) Verify site and webhooks

- Visit the Vercel deployment URL (or your domain) and verify pages load (home, events, results, admin page).
- If you want to be notified of builds or set up CI, configure GitHub actions or webhooks in the repo settings.

7) Troubleshooting

- Build errors: open the Vercel deployment log to see `npm run build` output.
- Missing env vars: ensure they are present in both Preview and Production environments in Vercel.
- API behavior different locally vs. Vercel: remember the stub subscription store uses `src/data/subscribers.json` file writes; serverless function environments are ephemeral and file writes may not persist across executions. For production, switch to Supabase (see `README_SUBSCRIPTIONS.md`).

Notes specific to this project

- Content-by-PR model: continue pushing JSON/MD changes via PR to update events. The admin UI can create PRs using a service PAT (we haven't wired this yet).
- Do not rely on file-based `src/data/subscribers.json` on Vercel. Use Supabase or other DB for persistence in production.

If you want, I can:
- Walk through pushing the repo to GitHub and connecting to Vercel interactively.
- Create a Vercel project via the CLI and demonstrate a deploy.
- Convert the subscription stub to use Supabase and wire SES for email sending once you provide credentials.

