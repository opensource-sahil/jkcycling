# JK Cycling

The website for the cycling community in Jammu & Kashmir — upcoming races,
published results, and an email list that announces new events.

Live at **[jkcycling.com](https://jkcycling.com)**.

## Stack

Next.js 16 (App Router) · TypeScript · CSS Modules · DynamoDB · S3 +
CloudFront · Auth.js with Google · Resend · Vercel · Vitest.

There is no Tailwind in this project — styling is CSS Modules plus CSS custom
properties. See [`GEMINI.md`](./GEMINI.md) §6.

## Getting started

Requires Node.js 20+ and a `.env.local` with AWS, Auth.js, and Resend
credentials (see [`GEMINI.md`](./GEMINI.md) §10 for the full list).

```bash
npm install
npm run dev          # http://localhost:3000
```

The app reads and writes real DynamoDB tables — there is no local database or
fixture mode, so `npm run dev` and `npm run build` both need valid AWS
credentials.

```bash
npm test             # vitest, single run
npm run test:watch
npm run build        # production build; also type-checks
npm run lint
```

## Admin

`/admin` requires signing in with Google *and* having your address listed in
`ADMIN_EMAILS`. From there you can create and edit events, upload a poster and
a results PDF, enter podium placings, delete events, and email confirmed
subscribers about an upcoming race.

## Documentation

| Document | Contents |
| --- | --- |
| [`GEMINI.md`](./GEMINI.md) | Architecture, data rules, styling and email invariants, conventions. Read this first. |
| [`README_SUBSCRIPTIONS.md`](./README_SUBSCRIPTIONS.md) | How the subscribe / confirm / announce / unsubscribe flow works. |
| [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md) | Deployment and environment configuration. |
