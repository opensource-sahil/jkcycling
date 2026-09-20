# Design system migration — public site

**Date:** 2026-09-20
**Branch:** `feature/new-design-system`
**Status:** Approved design → ready for implementation plan

## Summary

Apply the new **JK Cycling design system** (at `D:\Development\jk-cycling-design-system`)
to the public-facing website. The current site runs on the default Next.js
template palette (Vercel blue on flat white); this replaces it with the
token-based pine-green / sunrise-orange identity, matching the design system's
full-page HTML mockups closely while binding every page to the site's real data.

The design system ships a migration playbook (`INTEGRATION.md`), a drop-in
`tokens.css` (both themes), component READMEs, and `pages/*.html` mockups + a
shared `pages/pages.css` that implements the component vocabulary as real CSS.
Those mockups are **visual targets, not production React** — we port their markup
structure and DS class names into the existing CSS-Modules + tokens setup and
never copy their invented content.

## Goals

- Every **public** page visually matches its mockup in both **Daylight** (light)
  and **Alpine Night** (dark) themes, at mobile and desktop widths.
- All styling flows from design-system **tokens** — no hardcoded hexes that
  differ between themes.
- Real data drives every page; no fabricated data fields are introduced.
- Existing behavior (auth, subscribe flow, theming, revalidation) is preserved.
- `npm run build`, `npm run lint`, and `npm run test` stay green.

## Non-goals

- **Admin area restyle** (dashboard, event/group forms, podium editor). Deferred
  to a separate follow-up spec. The shared `Header`/`Footer` are restyled now
  and admin inherits them, but admin-only screens keep their current styling this
  branch.
- **New data fields.** No distance/elevation/subtype added to the `Event` model.
- **Fabricated content**, beyond the hero's tunable static placeholder stats.
- Unrelated refactoring.

## Context: current vs. target

| Area | Current | Target (design system) |
| --- | --- | --- |
| Palette | Next.js blue, `--color-*` vars, `globals.css` | Pine/sunrise tokens in `tokens.css`, both themes |
| Theme | `next-themes` `attribute="class"` → `light`/`dark` | Unchanged — `tokens.css` targets both `[data-theme]` and `.light`/`.dark` |
| Fonts | system-ui | Inter (sans), Space Grotesk (display), Space Mono (mono) |
| Globals | `.container`, `.btn`, `.btn-primary`, `.btn-outline` | Retuned `.container`, full `.btn*`/`.badge*`/`.card`/`.input` + type classes |
| Header | scroll-hide, auth, ThemeSwitcher | sticky blurred bar, brand mark, DS nav, theme icon-btn, Donate CTA, mobile drawer (+ auth preserved) |
| Footer | 3-col, on-surface | inverse 4-col with real subscribe form |
| Hero | background photo + overlay | 2-col copy + SVG mountain art, stat row |
| Event card | photo + type + description | DS card; real photo (gradient+icon fallback); stats = type · district · date; derived status badge |
| Result card | photo + top-3 list | podium (top 3) + scrolling results table, mono times, podium badge colors |

**Data reality that shapes fidelity:**

- `Event` has `image`, `type`, `district`, `date`, `categories[]`, `status`,
  `registration.isOpen`, `results[]`. It has **no** distance/elevation. Event
  cards therefore show `type · district · date`, not the mockup's `142 km ·
  2,380 m · gran fondo`.
- Podium/results, ride groups, badges, and subscribe all map cleanly to real
  data. The training page is fully static content.

## Approved decisions

1. **Scope:** public pages this branch; admin deferred to a follow-up spec.
2. **Fidelity:** match the mockups closely (port layout + component vocabulary).
3. **Training page:** add it (`/training`, static content) + nav link.
4. **Event card media & stats:** real photo as media, gradient+sport-icon
   fallback when no image; stats line from real fields (`type · district ·
   date`); no fabricated distance/elevation.
5. **Hero stats:** keep the stat row as static placeholder copy for the user to
   tune later.
6. **Nav mapping:** Home, Results, Groups, Training, Donate. No separate
   "Events" route — Home is the events hub. Donate is also a primary CTA button.
7. **Fonts:** self-host via `next/font/google`; point `--font-*` tokens at the
   generated variables; drop the `@import` from `tokens.css`.
8. **Dead code:** remove `src/components/ui/` (Card/Container drop styling and
   `className`; Button is a thin `.btn` wrapper) after confirming nothing imports
   them.

## Implementation plan (low-risk order, per INTEGRATION.md)

### Phase 1 — Foundation

- Copy `tokens.css` → `src/app/tokens.css`; `@import './tokens.css';` at the top
  of `globals.css`.
- Fonts: add Inter / Space Grotesk / Space Mono via `next/font/google` in
  `layout.tsx`; set the `--font-*` tokens to the generated CSS variables; remove
  the Google Fonts `@import` line from `tokens.css`.
- Rewrite `globals.css`: keep the reset; replace `.container`, `.btn`,
  `.btn-primary`, `.btn-outline`; add DS globals ported from `pages.css`
  (`.btn--*`, `.badge--*`, `.card`, `.input`/`.field`/`.hint`, `.eyebrow`,
  `.section`, `.section-head`, `.muted`, `.link`, table + podium helpers as
  needed). Type classes come from `tokens.css`.
- Note the escaped token name `var(--space-1\.5)` in CSS.

### Phase 2 — Shared shell

- **Header** (`Header.tsx` + `Header.module.css`): sticky blurred bar; brand
  with mountain mark; nav (Home/Results/Groups/Training/Donate) with `.active`
  state; theme icon-button (keep `ThemeSwitcher` logic); Donate primary CTA;
  mobile hamburger → token-styled drawer using `--overlay`. **Preserve auth:**
  sign in / sign out / avatar and the Admin link when a session exists.
- **Footer** (`Footer.tsx` + `Footer.module.css`): inverse
  (`--surface-inverse`/`--text-inverse`) 4-column grid — brand, Explore,
  Community, Race announcements. The subscribe form wires to the real
  `SubscribeForm` action, not a dead input.
- **Hero** (`Hero.tsx` + `Hero.module.css`): 2-column copy + inline SVG mountain
  art; `display`-family title; lede; two CTAs; stat row (static placeholder
  numbers, clearly marked for tuning). Remove the background-image treatment.

### Phase 3 — Components

- **EventCard**: DS card chrome + type classes; media = `event.image` when
  present, else gradient+sport-icon block chosen from `event.type`; stats line
  `type · district · date`; status badge derived from `status` /
  `registration.isOpen` (e.g. registration open → `badge--success`).
- **ResultCard** + `results/[id]` detail: podium (top 3 from `event.results`,
  gold/silver/bronze), results table that scrolls horizontally inside the card,
  `mono` tabular times. Keep the "Download full results (PDF)" affordance when
  `event.notice` is set.
- **SubscribeForm** + inputs: DS `.field` / `.input` / focus-ring treatment.
- Delete `src/components/ui/` after grep-confirming no imports.

### Phase 4 — Pages (port each mockup, bind to data)

- **Home** (`app/page.tsx`): hero + "Upcoming races" grid (EventCards) +
  "Latest results" podium section (derived from completed events with results) +
  subscribe band.
- **Event detail** (`events/[id]`): port `event-detail.html`.
- **Results** (`results/`): list + filter chips; port `results.html`.
- **Result detail** (`results/[id]`): port `result-detail.html`.
- **Ride groups** (`groups/`): port `ride-groups.html` (name, district,
  disciplines, schedule, pace, links, contact).
- **Donate** (`donate/`): port `donate.html`.
- **Training** (`app/training/page.tsx`, new): static plans + altitude tips +
  FAQ from `training.html`; add nav link.

### Phase 5 — Verification

- `npm run build`, `npm run lint`, `npm run test` all green (existing vitest
  tests are logic/action tests and should be unaffected; keep them green).
- Visual pass of **every** public page in **both themes** at mobile and desktop,
  compared against the mockups.
- Accessibility guardrails: AA contrast via tokens; `:focus-visible` rings kept
  (never `outline: none` without a replacement); status never color-alone.

## Risks & mitigations

- **Wide `--color-*` blast radius** (~208 references across module CSS): migrate
  per-component as each is touched, using the INTEGRATION.md mapping table; grep
  for stragglers before the verification gate.
- **Header auth regression:** the mockup omits auth; we must not. Keep the
  session-driven sign-in/out/avatar/Admin-link logic while restyling.
- **Footer subscribe duplication:** reuse the existing subscribe server
  action/component rather than a second implementation.
- **`next/font` + tokens wiring:** if the generated font variables aren't picked
  up, fall back to keeping the `tokens.css` `@import` for now (dev-acceptable).

## Files touched (anticipated)

- Add: `src/app/tokens.css`, `src/app/training/page.tsx`,
  `src/app/training/Training.module.css`.
- Rewrite: `src/app/globals.css`, `src/app/layout.tsx`, `Header.*`, `Footer.*`,
  `Hero.*`, `EventCard.*`, `ResultCard.*`, `SubscribeForm.*`, and the page +
  module files for home, events/[id], results, results/[id], groups, donate.
- Delete: `src/components/ui/` (after confirming no imports).
- Untouched: admin screens, services, lib, types, API routes, tests.
