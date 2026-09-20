# Design System Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the entire public-facing JK Cycling site to the new design system, matching the design system's page mockups closely while binding every page to real data.

**Architecture:** Drop the design system's `tokens.css` into the app and drive everything from its CSS custom properties (both themes). Rewrite `globals.css` with the design system's global utility classes, self-host the three fonts via `next/font`, then restyle the shared shell (Header/Footer/Hero), the shared components (EventCard/ResultCard/SubscribeForm), and each public page by porting its mockup markup into the existing CSS-Modules structure. Testable logic (event media/badge selection, latest-results derivation) is extracted into small `src/lib` helpers with unit tests; pure CSS porting is verified by build + lint + a visual pass against the mockups in both themes.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, CSS Modules, `next-themes`, `next/font/google`, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-20-design-system-migration-design.md`

## Global Constraints

- **Design system source (read-only reference):** `D:\Development\jk-cycling-design-system` — `tokens.css`, `tokens.json`, `INTEGRATION.md`, `README.md`, `components/*/README.md`, `pages/*.html`, `pages/pages.css`. Mockups are visual targets, not production React — port markup/classes, never copy invented content.
- **Tokens only for theme-varying values.** Never hardcode a hex that differs between light and dark; use the token. Escape the dotted token name in CSS as `var(--space-1\.5)`.
- **Theme strategy is unchanged:** `next-themes` `attribute="class"` toggling `light`/`dark`; `tokens.css` already targets `[data-theme]` and `.light`/`.dark`. Do **not** edit `providers.tsx`.
- **Scope is public pages only.** Do not restyle admin screens (`src/app/admin/**`, `src/components/admin/**`). The shared Header/Footer are restyled and admin inherits them.
- **No new data fields.** Do not add distance/elevation/subtype to the `Event` model.
- **Preserve behavior:** auth (sign in/out/avatar/Admin link), the subscribe flow (reuse `SubscribeForm` + its server action), and page `revalidate` values.
- **Real service APIs:** `eventService.getUpcomingEvents()`, `eventService.getPastEvents()`, `eventService.getEventById(id)`, `rideGroupService.listPublished()`.
- **Verification gate (every CSS task):** `npm run lint` and `npm run build` pass; the page renders correctly in **both** themes at mobile (~390px) and desktop (~1280px). `:focus-visible` rings preserved; status never color-alone.
- **Test command:** `npm run test` (Vitest). Run the full suite green before the final task.
- **Commit style:** small, frequent commits; conventional prefixes (`feat:`, `style:`, `refactor:`, `test:`, `chore:`).

---

## File Structure

**Created:**
- `src/app/tokens.css` — copy of the design system tokens (both themes).
- `src/lib/event-card.ts` — `getEventMedia(event)`, `getEventStatusBadge(event)` (testable logic).
- `src/lib/event-card.test.ts` — unit tests for the above.
- `src/lib/results.ts` — `getLatestResult(events)`, `getPodium(results)` (testable logic).
- `src/lib/results.test.ts` — unit tests for the above.
- `src/app/training/page.tsx`, `src/app/training/Training.module.css` — new static Training page.

**Rewritten:**
- `src/app/globals.css`, `src/app/layout.tsx`.
- `src/components/Header.{tsx,module.css}`, `Footer.{tsx,module.css}`, `Hero.{tsx,module.css}`.
- `src/components/EventCard.{tsx,module.css}`, `ResultCard.{tsx,module.css}`, `SubscribeForm.{tsx,module.css}`, `RideGroupCard.{tsx,module.css}`.
- Pages + modules: `app/page.tsx`; `events/[id]/page.tsx` + `EventDetail.module.css`; `results/page.tsx` + `Results.module.css`; `results/[id]/page.tsx` + `ResultDetail.module.css`; `groups/page.tsx` + `Groups.module.css`; `donate/page.tsx` + `Donate.module.css`.

**Deleted:**
- `src/components/ui/` (`Button.tsx`, `Card.tsx`, `Container.tsx`, `index.ts`) — after confirming no imports.

**Untouched:** `src/app/admin/**`, `src/components/admin/**`, `src/services/**`, `src/types/**`, `src/app/api/**`, `providers.tsx`, existing tests.

---

## Task 1: Foundation — tokens, fonts, global styles

**Files:**
- Create: `src/app/tokens.css`
- Modify: `src/app/globals.css` (full rewrite), `src/app/layout.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: global CSS classes `.container`, `.btn`/`.btn--primary`/`.btn--secondary`/`.btn--accent`/`.btn--ghost`/`.btn--danger`/`.btn--lg`/`.btn--sm`/`.btn--block`, `.badge`/`.badge--{success,warning,danger,info,neutral,brand,gold,silver,bronze}`, `.card`/`.card--interactive`, `.input`/`.field`/`.hint`, `.section`/`.section-head`/`.eyebrow`/`.muted`/`.link`; type classes from tokens (`.display-2xl/xl/lg`, `.h1`–`.h4`, `.body-lg/body/body-sm`, `.label`, `.caption`, `.overline`, `.mono-time`, `.mono-sm`). CSS variables `--surface*`, `--text*`, `--primary*`, `--accent*`, `--border*`, `--space-N`, `--radius-*`, `--shadow-*`, `--font-{display,sans,mono}`, `--on-primary`, `--on-accent`, `--surface-inverse`, `--text-inverse`, `--overlay`, `--podium-{gold,silver,bronze}`.

- [ ] **Step 1: Copy tokens.css into the app**

Copy `D:\Development\jk-cycling-design-system\tokens.css` to `src/app/tokens.css` verbatim.

- [ ] **Step 2: Self-host the fonts via next/font and wire the family tokens**

In `src/app/tokens.css`, delete the `@import url('https://fonts.googleapis.com/...')` line (line ~9). Then change the three font-family token declarations (around lines 122–124) to point at the `next/font` variables with the same fallback stacks:

```css
  --font-display: var(--font-display-src), system-ui, sans-serif;
  --font-sans: var(--font-sans-src), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: var(--font-mono-src), ui-monospace, "SFMono-Regular", "JetBrains Mono", monospace;
```

In `src/app/layout.tsx`, add at the top and apply the variables to `<html>`:

```tsx
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans-src', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display-src', display: 'swap' });
const mono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono-src', display: 'swap' });
```

Change the opening tag to:

```tsx
<html lang="en" className={`${inter.variable} ${grotesk.variable} ${mono.variable}`} suppressHydrationWarning>
```

- [ ] **Step 3: Rewrite globals.css**

Replace `src/app/globals.css` entirely. Keep `@import './tokens.css';` at the very top, then the reset, `body`, `a`, and port the shared component classes from `D:\Development\jk-cycling-design-system\pages\pages.css` (the `.container`, `.section`, `.section-head`, `.eyebrow`, `.muted`, `.link`, `.btn*`, `.badge*`, `.card*`, `.input`/`.field`/`.hint`, `.table`, `.podium`/`.pod*`, `.stat*`, `.chip*`, `.divider` blocks — copy them as-is since they already read from tokens). Body uses `background: var(--surface); color: var(--text); font-family: var(--font-sans);`.

```css
@import './tokens.css';

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; transition: color 0.15s ease; }

.container { max-width: 1120px; margin: 0 auto; padding: 0 var(--space-4); }
@media (min-width: 768px) { .container { padding: 0 var(--space-6); } }

/* …paste the .section, .btn*, .badge*, .card*, .input/.field/.hint, .table,
   .podium/.pod*, .stat*, .chip*, .eyebrow, .muted, .link, .divider blocks
   from pages/pages.css here (they already reference tokens)… */
```

- [ ] **Step 4: Run lint and build**

Run: `npm run lint && npm run build`
Expected: PASS (no unresolved CSS var/import errors; fonts resolve).

- [ ] **Step 5: Visual smoke check**

Run `npm run dev`, open `/`. Expected: pine-green palette live, Inter body text, no layout crash. Toggle theme — colors flip to Alpine Night. (Pages look unstyled/rough here; that's fixed in later tasks.)

- [ ] **Step 6: Commit**

```bash
git add src/app/tokens.css src/app/globals.css src/app/layout.tsx
git commit -m "feat: drop in design-system tokens, fonts, and global classes"
```

---

## Task 2: Header

**Files:**
- Modify: `src/components/Header.tsx`, `src/components/Header.module.css` (full rewrite)

**Interfaces:**
- Consumes: Task 1 tokens/classes; existing `ThemeSwitcher`, `useSession`/`signIn`/`signOut`.
- Produces: restyled sticky header used by the root layout; nav route list.

- [ ] **Step 1: Rewrite the header markup**

Model the markup on `D:\Development\jk-cycling-design-system\pages\home.html` header (`.site-header > .container.bar`): brand with the mountain `<svg class="mark">`, a nav, header actions. Nav items (map to real routes):

```tsx
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Results', href: '/results' },
  { name: 'Groups', href: '/groups' },
  { name: 'Training', href: '/training' },
  { name: 'Donate', href: '/donate' },
];
```

Mark the active link using `usePathname()` (`className={pathname === item.href ? styles.active : ''}`). Keep `'use client'`.

- [ ] **Step 2: Preserve auth + theme + add mobile drawer**

Keep the existing session logic: when `session?.user`, render the avatar/sign-out button and an `Admin` link to `/admin`; otherwise a `Sign In` button (`signIn('google')`). Keep `<ThemeSwitcher />` (restyle its button to the `.icon-btn` look via the module). Add a hamburger `.icon-btn` visible below 900px that toggles a `useState` drawer; the drawer overlays using `var(--overlay)` and lists the same nav items. Include a `Donate` primary CTA (`btn btn--primary btn--sm`) in the desktop actions.

- [ ] **Step 3: Rewrite Header.module.css**

Port the `.site-header`, `.bar`, `.brand`, `.mark`, `.nav`, `.nav a`/`:hover`/`.active`, `.icon-btn`, `.header-actions`, `.menu-btn` rules from `pages/pages.css` into the module (translate the global selectors to module class names). Add drawer styles (fixed panel, `var(--surface-raised)`, `var(--overlay)` backdrop, slide/opacity transition). Sticky + blur: `position: sticky; top: 0; background: color-mix(in srgb, var(--surface-raised) 85%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border);`. Replace any `--color-*` references.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`. Then `npm run dev`: header sticky + blurred; nav active state correct on each route; theme toggle works; **logged out** shows Sign In; **logged in** shows avatar + Admin link (verify by signing in); mobile width shows hamburger → drawer opens/closes. Check both themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/Header.module.css
git commit -m "feat: restyle header to design system with mobile drawer"
```

---

## Task 3: Footer

**Files:**
- Modify: `src/components/Footer.tsx`, `src/components/Footer.module.css` (full rewrite)

**Interfaces:**
- Consumes: Task 1; the existing `SubscribeForm` component/action.
- Produces: restyled inverse footer used by the root layout.

- [ ] **Step 1: Rewrite the footer markup**

Model on the footer in `pages/home.html` / `pages/training.html`: inverse 4-column `.foot-grid` — (1) brand + tagline, (2) Explore links (Home, Results, Ride groups, Training), (3) Community (About/Volunteer/Donate/Contact — reuse the existing Instagram/Facebook/Contact links where present, keep real hrefs), (4) "Race announcements" column containing the real subscribe form. Bottom row: `© <current year> JK Cycling` + `Srinagar · Jammu & Kashmir`.

- [ ] **Step 2: Wire the real subscribe form**

In the "Race announcements" column, render the existing `<SubscribeForm />` (or its compact variant) rather than a dead `<input>`, so the footer subscribe actually posts to the subscribe action. If `SubscribeForm` is too tall for the footer, pass a prop/variant for the inline layout (email + button on one row) — reuse the same server action, do not duplicate it.

- [ ] **Step 3: Rewrite Footer.module.css**

Port `.site-footer`, `.foot-grid`, `.site-footer h4`, `.site-footer a`, `.foot-brand`, `.foot-sub`, `.foot-bottom` from `pages/pages.css`. Use `background: var(--surface-inverse); color: var(--text-inverse);`. Replace `--color-*`.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`. `npm run dev`: footer is dark/inverse in both themes; links go to real routes; entering an email and submitting hits the subscribe flow (network request to the subscribe endpoint/action fires). Check both themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.tsx src/components/Footer.module.css
git commit -m "feat: rebuild footer as inverse 4-column with real subscribe form"
```

---

## Task 4: EventCard logic helpers (TDD)

**Files:**
- Create: `src/lib/event-card.ts`, `src/lib/event-card.test.ts`

**Interfaces:**
- Consumes: `Event`, `EventType` from `@/types/event`.
- Produces:
  - `getEventMedia(event: Event): { kind: 'image'; src: string } | { kind: 'gradient'; variant: 'green' | 'sky' | 'flat'; icon: EventType }`
  - `getEventStatusBadge(event: Event): { label: string; tone: 'success' | 'warning' | 'neutral' | 'danger' | 'brand' } | null`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { getEventMedia, getEventStatusBadge } from './event-card';
import type { Event } from '@/types/event';

const base: Event = {
  id: '1', title: 'T', date: '2026-07-18', district: 'Srinagar', type: 'Road',
  description: '', location: '', image: '', categories: [],
  registration: { isOpen: true }, status: 'UPCOMING',
  audit: { createdAt: '', updatedAt: '' },
};

describe('getEventMedia', () => {
  it('uses the image when one is set', () => {
    expect(getEventMedia({ ...base, image: '/x.jpg' })).toEqual({ kind: 'image', src: '/x.jpg' });
  });
  it('falls back to a gradient block keyed to the event type when no image', () => {
    const m = getEventMedia({ ...base, image: '' });
    expect(m.kind).toBe('gradient');
    if (m.kind === 'gradient') expect(m.icon).toBe('Road');
  });
});

describe('getEventStatusBadge', () => {
  it('shows Registration open when registration is open and event is upcoming', () => {
    expect(getEventStatusBadge({ ...base, status: 'UPCOMING', registration: { isOpen: true } }))
      .toEqual({ label: 'Registration open', tone: 'success' });
  });
  it('shows Cancelled with danger tone', () => {
    expect(getEventStatusBadge({ ...base, status: 'CANCELLED' }))
      .toEqual({ label: 'Cancelled', tone: 'danger' });
  });
  it('returns null for a completed event', () => {
    expect(getEventStatusBadge({ ...base, status: 'COMPLETED' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- src/lib/event-card.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
import type { Event, EventType } from '@/types/event';

export function getEventMedia(event: Event) {
  if (event.image) return { kind: 'image' as const, src: event.image };
  const variant = event.type === 'Road' ? 'green' as const
    : event.type === 'MTB' || event.type === 'Downhill' || event.type === 'Enduro' ? 'sky' as const
    : 'flat' as const;
  return { kind: 'gradient' as const, variant, icon: event.type as EventType };
}

export function getEventStatusBadge(event: Event) {
  if (event.status === 'CANCELLED') return { label: 'Cancelled', tone: 'danger' as const };
  if (event.status === 'COMPLETED') return null;
  if (event.status === 'UPCOMING') {
    return event.registration.isOpen
      ? { label: 'Registration open', tone: 'success' as const }
      : { label: 'Coming soon', tone: 'neutral' as const };
  }
  return null;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- src/lib/event-card.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/event-card.ts src/lib/event-card.test.ts
git commit -m "test: add event card media/badge helpers"
```

---

## Task 5: EventCard component

**Files:**
- Modify: `src/components/EventCard.tsx`, `src/components/EventCard.module.css` (full rewrite)

**Interfaces:**
- Consumes: Task 4 helpers; Task 1 classes.
- Produces: `<EventCard event={event} />` used by home + EventsList.

- [ ] **Step 1: Rewrite the card markup**

Model on the `.ec` markup in `pages/home.html` + `components/EventCard/README.md`. Structure: media block, then body with eyebrow (`{district} · {month}`), `.ec__name` title, `.ec__date` (formatted `event.date`), `.ec__stats` line = `` `${event.type} · ${event.district}` `` (mono), the status badge from `getEventStatusBadge`, and an action button (`View details` → `/events/${event.id}`; when `registration.isOpen`, an accent "Register to ride" that links to `registration.url` if present else the detail page). Use `getEventMedia`: `kind==='image'` → `next/image` fill; `kind==='gradient'` → the `.m-green/.m-sky/.m-flat` block with an inline SVG icon chosen from `icon`.

- [ ] **Step 2: Rewrite EventCard.module.css**

Port `.ec`, `.ec__media`, `.m-green/.m-sky/.m-flat`, `.ec__body`, `.ec__name`, `.ec__date`, `.ec__stats`, `.ec__act` from `pages/pages.css`. Replace `--color-*` with tokens.

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`. `npm run dev` on `/`: cards show real photos where events have them, gradient+icon where they don't, correct stats line, correct status badge, working links. Both themes.

- [ ] **Step 4: Commit**

```bash
git add src/components/EventCard.tsx src/components/EventCard.module.css
git commit -m "feat: restyle EventCard to design system"
```

---

## Task 6: Results derivation helpers (TDD)

**Files:**
- Create: `src/lib/results.ts`, `src/lib/results.test.ts`

**Interfaces:**
- Consumes: `Event`, `Result` from `@/types/event`.
- Produces:
  - `getLatestResult(events: Event[]): Event | null` — most-recent past event that has a non-empty `results` array.
  - `getPodium(results: Result[] | undefined): Result[]` — the entries at positions 1/2/3, sorted, max 3.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { getLatestResult, getPodium } from './results';
import type { Event, Result } from '@/types/event';

const ev = (id: string, date: string, results?: Result[]): Event => ({
  id, title: id, date, district: 'X', type: 'Road', description: '', location: '',
  image: '', categories: [], registration: { isOpen: false }, status: 'COMPLETED',
  audit: { createdAt: '', updatedAt: '' }, results,
});
const r = (position: number, name: string, time: string): Result => ({ position, name, time, category: 'Open' });

describe('getLatestResult', () => {
  it('returns the most recent event that has results', () => {
    const events = [ev('a', '2026-01-01', [r(1, 'A', '1:00')]), ev('b', '2026-05-01', [r(1, 'B', '2:00')]), ev('c', '2026-06-01')];
    expect(getLatestResult(events)?.id).toBe('b');
  });
  it('returns null when no event has results', () => {
    expect(getLatestResult([ev('a', '2026-01-01'), ev('b', '2026-02-01', [])])).toBeNull();
  });
});

describe('getPodium', () => {
  it('returns positions 1-3 sorted', () => {
    const podium = getPodium([r(3, 'C', '3'), r(1, 'A', '1'), r(2, 'B', '2'), r(4, 'D', '4')]);
    expect(podium.map((p) => p.position)).toEqual([1, 2, 3]);
  });
  it('handles undefined', () => { expect(getPodium(undefined)).toEqual([]); });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- src/lib/results.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
import type { Event, Result } from '@/types/event';

export function getLatestResult(events: Event[]): Event | null {
  const withResults = events.filter((e) => (e.results?.length ?? 0) > 0);
  if (withResults.length === 0) return null;
  return withResults.sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
}

export function getPodium(results: Result[] | undefined): Result[] {
  if (!results) return [];
  return results
    .filter((r) => r.position >= 1 && r.position <= 3)
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- src/lib/results.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/results.ts src/lib/results.test.ts
git commit -m "test: add latest-result and podium helpers"
```

---

## Task 7: ResultCard + result detail

**Files:**
- Modify: `src/components/ResultCard.tsx`, `src/components/ResultCard.module.css`, `src/app/results/[id]/page.tsx`, `src/app/results/[id]/ResultDetail.module.css`

**Interfaces:**
- Consumes: Task 6 `getPodium`; Task 1 classes.
- Produces: restyled result card + detail page.

- [ ] **Step 1: Restyle ResultCard**

Model on `components/ResultCard/README.md` + the results card in `pages/results.html`. Show event name, `district · date`, and a podium (top 3 via `getPodium(event.results)`) using `.pod`/`.pod--1/2/3` with mono times; when there are no results, a "Results pending" state; keep the "Download full results (PDF)" button when `event.notice` is set. Port the module CSS from the `.pod*` rules in `pages/pages.css`.

- [ ] **Step 2: Restyle result detail**

Port `pages/result-detail.html`: header (event name, date, distance/district meta from real fields), the podium block, and the full results `.table` (position/name/time/category, `mono` tabular `.num` for times, `tr.win` highlight for position 1) that scrolls horizontally inside its card on mobile. Rewrite `ResultDetail.module.css` from the `.table`/`.podium`/`.pod*` rules; replace `--color-*`.

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`. `npm run dev`: `/results` cards show podium + mono times; a result detail page shows the podium and a scrolling table with tabular times; PDF button appears only when `notice` set. Both themes.

- [ ] **Step 4: Commit**

```bash
git add src/components/ResultCard.tsx src/components/ResultCard.module.css src/app/results/[id]/page.tsx src/app/results/[id]/ResultDetail.module.css
git commit -m "feat: restyle result card and result detail with podium + table"
```

---

## Task 8: SubscribeForm + inputs

**Files:**
- Modify: `src/components/SubscribeForm.tsx`, `src/components/SubscribeForm.module.css`

**Interfaces:**
- Consumes: Task 1 `.field`/`.input`/`.btn` classes.
- Produces: restyled subscribe form (used on home, footer, event detail).

- [ ] **Step 1: Restyle**

Keep all existing form logic and the server action untouched. Apply `.field`/`.input`/`.hint` and `.btn btn--primary` styling per `components/Input/README.md`. Ensure the focus ring uses `--border-focus`. If Task 3 needed an inline variant, add a `variant?: 'stacked' | 'inline'` prop that only changes layout (flex row vs column), not behavior.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build`. `npm run dev`: submit a test email on `/` and confirm the existing success/error states still render and the action fires. Focus ring visible. Both themes.

- [ ] **Step 3: Commit**

```bash
git add src/components/SubscribeForm.tsx src/components/SubscribeForm.module.css
git commit -m "feat: restyle subscribe form and inputs"
```

---

## Task 9: Hero + Home page

**Files:**
- Modify: `src/components/Hero.tsx`, `src/components/Hero.module.css`, `src/app/page.tsx`

**Interfaces:**
- Consumes: Tasks 1, 5, 6, 8; `eventService.getUpcomingEvents()`, `getPastEvents()`.
- Produces: redesigned home page.

- [ ] **Step 1: Rebuild the Hero**

Port the `.hero` section from `pages/home.html`: two-column `.hero__grid` (copy + inline SVG mountain art), eyebrow "Jammu & Kashmir", `display`-family `.hero__title` "Ride the high passes.", `.hero__lede`, two CTAs (`See upcoming races` → `#upcoming`, `Find a ride group` → `/groups`), and the `.stat-row` with **static placeholder** stats (add a code comment: `// TODO(content): replace with real figures`). Remove the background-image markup. Port `.hero`, `.hero__grid`, `.hero__title`, `.hero__lede`, `.hero__cta`, `.stat*` into `Hero.module.css`.

- [ ] **Step 2: Rebuild the home page composition**

Rewrite `src/app/page.tsx` to render: `<Hero />`; an `#upcoming` section (`.section-head` "Upcoming races & rides" + `EventsList`/EventCards grid) using `getUpcomingEvents()`; a "Latest results" section on `--surface-sunken` background rendering a podium card from `getLatestResult(await getPastEvents())` (hidden if null); and a subscribe band (`.subscribe-band` from `pages/home.html`, using `SubscribeForm`). Keep `export const revalidate = 3600;`. Port `.section`/`.subscribe-band` styles (globals or a home module).

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`. `npm run dev` on `/`: hero matches mockup (2-col, art, stats); upcoming grid renders EventCards; latest-results podium shows when past results exist; subscribe band works. Both themes, mobile + desktop.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx src/components/Hero.module.css src/app/page.tsx
git commit -m "feat: rebuild hero and home page to design system"
```

---

## Task 10: Event detail page

**Files:**
- Modify: `src/app/events/[id]/page.tsx`, `src/app/events/[id]/EventDetail.module.css`

**Interfaces:**
- Consumes: Tasks 1, 8; `eventService.getEventById(id)`.
- Produces: restyled event detail page.

- [ ] **Step 1: Port the mockup**

Port `pages/event-detail.html` structure to the real data: hero/title block (name, `type · district · date` tag line, status badge), description, categories as `.chip`s, registration panel (fee/deadline/instructions/`Register` button from `event.registration`), organizer/contact block (from `event.organizer`), and the notice link when set. Keep the existing data fetching + `notFound()` handling. Rewrite `EventDetail.module.css` from tokens; replace `--color-*`.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build`. `npm run dev`: open an event detail page — layout matches mockup, registration/organizer/notice render from real data, register button appears only when `registration.isOpen`/`url`. Both themes.

- [ ] **Step 3: Commit**

```bash
git add src/app/events/[id]/page.tsx src/app/events/[id]/EventDetail.module.css
git commit -m "feat: restyle event detail page"
```

---

## Task 11: Results list page

**Files:**
- Modify: `src/app/results/page.tsx`, `src/app/results/Results.module.css`

**Interfaces:**
- Consumes: Tasks 1, 7; `eventService.getPastEvents()`.
- Produces: restyled results list.

- [ ] **Step 1: Port the mockup**

Port `pages/results.html`: page header/eyebrow, optional filter `.chip`s (if implemented, filter the already-fetched past events client-side by `type`; otherwise omit chips — do not add fake filters), and the grid of `ResultCard`s. Keep the empty state. Keep `export const revalidate = 3600;`. Rewrite `Results.module.css` from tokens.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build`. `npm run dev` on `/results`: header + result cards match mockup; empty state styled; filters (if added) work. Both themes.

- [ ] **Step 3: Commit**

```bash
git add src/app/results/page.tsx src/app/results/Results.module.css
git commit -m "feat: restyle results list page"
```

---

## Task 12: Ride groups page

**Files:**
- Modify: `src/app/groups/page.tsx`, `src/app/groups/Groups.module.css`, `src/components/RideGroupCard.tsx`, `src/components/RideGroupCard.module.css`

**Interfaces:**
- Consumes: Task 1; `rideGroupService.listPublished()`; existing `groupByDistrict` helper.
- Produces: restyled ride groups page + card.

- [ ] **Step 1: Port the mockup**

Port `pages/ride-groups.html`: page header, per-district sections (keep the existing `groupByDistrict` grouping), and `RideGroupCard`s showing name, discipline badges, pace badge, schedule, meeting point, and link buttons (WhatsApp/Strava/Instagram/website) + contact. Rewrite both module CSS files from tokens; replace `--color-*`.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build`. `npm run dev` on `/groups`: district sections + cards match mockup; discipline/pace badges styled; external links work. Both themes.

- [ ] **Step 3: Commit**

```bash
git add src/app/groups/page.tsx src/app/groups/Groups.module.css src/components/RideGroupCard.tsx src/components/RideGroupCard.module.css
git commit -m "feat: restyle ride groups page and card"
```

---

## Task 13: Donate page

**Files:**
- Modify: `src/app/donate/page.tsx`, `src/app/donate/Donate.module.css`

**Interfaces:**
- Consumes: Task 1.
- Produces: restyled donate page.

- [ ] **Step 1: Port the mockup**

Port `pages/donate.html` structure and keep all existing real donate content (bank/UPI/QR details, `qrcode.react` usage if present). Rewrite `Donate.module.css` from tokens; replace `--color-*`. Do not invent donation methods — reuse whatever the current page already shows.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build`. `npm run dev` on `/donate`: matches mockup; real donate details intact; QR renders. Both themes.

- [ ] **Step 3: Commit**

```bash
git add src/app/donate/page.tsx src/app/donate/Donate.module.css
git commit -m "feat: restyle donate page"
```

---

## Task 14: Training page (new)

**Files:**
- Create: `src/app/training/page.tsx`, `src/app/training/Training.module.css`
- Modify: (nav link already added in Task 2)

**Interfaces:**
- Consumes: Task 1.
- Produces: new `/training` static page.

- [ ] **Step 1: Build the page**

Port `pages/training.html` (fully static content): intro/eyebrow, "Pick a training plan" `.grid-cards` (3 plan cards with Beginner/Intermediate/Advanced badges, weeks/hours mono meta, bullet lists, "View the plan" buttons linking to `#`), "Riding the high passes" `.tips` grid (6 tips), and a "Common questions" `.faq` `<details>` block. Add `export const metadata = { title: 'Training' }`. Port the page-local `<style>` rules from `training.html` into `Training.module.css`.

- [ ] **Step 2: Verify nav + render**

Run: `npm run lint && npm run build`. `npm run dev`: `/training` renders all three sections matching the mockup; the "Training" nav link (from Task 2) is active here. Both themes, mobile + desktop.

- [ ] **Step 3: Commit**

```bash
git add src/app/training/page.tsx src/app/training/Training.module.css
git commit -m "feat: add training page"
```

---

## Task 15: Remove dead ui/ stubs

**Files:**
- Delete: `src/components/ui/Button.tsx`, `Card.tsx`, `Container.tsx`, `index.ts`

- [ ] **Step 1: Confirm no imports**

Run: `grep -rn "components/ui" src` and `grep -rn "from '@/components/ui'" src`.
Expected: no matches (if any exist, replace those usages with plain elements + `.btn`/`.card`/`.container` classes first, then continue).

- [ ] **Step 2: Delete the directory**

```bash
git rm -r src/components/ui
```

- [ ] **Step 3: Verify + commit**

Run: `npm run lint && npm run build`. Expected: PASS.

```bash
git commit -m "chore: remove unused ui/ stub components"
```

---

## Task 16: Final verification & cleanup

**Files:** none (verification only; small fixes as needed).

- [ ] **Step 1: Grep for leftover old variables**

Run: `grep -rn "\-\-color-\(bg\|surface\|text\|border\|primary\|accent\|success\)" src --include="*.css"` and `grep -rn "\-\-header-bg\|\-\-max-width\|btn-outline\|btn-primary\b" src`.
Expected: no stragglers. Fix any found by mapping to the new tokens/classes (INTEGRATION.md table), then re-commit.

- [ ] **Step 2: Full test suite**

Run: `npm run test`
Expected: all existing + new tests PASS.

- [ ] **Step 3: Full lint + build**

Run: `npm run lint && npm run build`
Expected: PASS, no warnings about missing images/fonts.

- [ ] **Step 4: Visual pass (both themes, mobile + desktop)**

`npm run dev`, walk every public route — `/`, `/events/[id]`, `/results`, `/results/[id]`, `/groups`, `/donate`, `/training` — in **light and dark**, at ~390px and ~1280px. Compare each against its `pages/*.html` mockup. Confirm: focus rings visible on keyboard tab; status badges carry words; footer inverse; header sticky/blur; no horizontal body scroll (tables scroll inside their cards).

- [ ] **Step 5: Final commit (if any fixes made)**

```bash
git add -A
git commit -m "chore: final design-system migration cleanup and verification"
```

---

## Self-Review

**Spec coverage:** Foundation → Task 1. Header (auth preserved, drawer, nav) → Task 2. Footer (inverse, real subscribe) → Task 3. EventCard (real photo/fields, derived badge) → Tasks 4–5. ResultCard + result detail (podium/table) → Tasks 6–7. SubscribeForm/inputs → Task 8. Hero (static stats) + Home (latest results) → Task 9. Event detail → Task 10. Results list → Task 11. Ride groups → Task 12. Donate → Task 13. Training (new + nav) → Task 14. Delete `ui/` stubs → Task 15. Fonts via next/font → Task 1. Theme unchanged → Global Constraints. Verification gate + both-theme visual pass → each task + Task 16. Admin deferred / no new fields → Non-goals honored (no admin or type-model tasks). **All spec sections covered.**

**Placeholder scan:** Logic steps carry real code; CSS-porting steps name the exact source mockup/`pages.css` blocks and tokens to use (concrete, committed reference material), not "style appropriately". The only intentional placeholder is the hero's static stats, explicitly flagged as content-TODO per the approved decision.

**Type consistency:** `getEventMedia`/`getEventStatusBadge` (Task 4) consumed in Task 5; `getLatestResult`/`getPodium` (Task 6) consumed in Tasks 7 and 9 with matching signatures. Service methods match the real API (`getUpcomingEvents`, `getPastEvents`, `getEventById`, `listPublished`). `SubscribeForm` `variant` prop introduced in Task 8, referenced by Task 3 (note: Task 3 runs first — if the inline variant is needed there, add the prop in Task 3 and Task 8 refines its styling; both reuse the one server action).
