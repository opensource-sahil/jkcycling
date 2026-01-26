# JK Cycling - Project Context for Gemini

## 1. Project Overview
**JK Cycling** is a cost-effective, low-maintenance web application designed to promote cycling in Jammu and Kashmir.
*   **Goal:** Aggregate upcoming events (MTB/Road), publish race results, and build a community.
*   **Target Audience:** ~50k-80k cycling enthusiasts.
*   **Core Constraint:** **Low Cost & Low Maintenance.** Infrastructure costs must be minimized.
    *   **NO external database** (like Postgres/MySQL) is currently used.
    *   **Data Storage:** Static JSON files in `src/data/` act as the primary database.

## 2. Tech Stack
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 4
*   **Runtime:** Node.js (v20+)
*   **Deployment:** Vercel (Standard Git-based deployment)

## 3. Architecture & Data Strategy

### File Structure
*   `src/app/`: App Router pages.
    *   `page.tsx`: Landing page (Upcoming Events).
    *   `events/[id]/`: Event details.
    *   `results/`: Race results.
    *   `admin/`: Basic data entry interface.
    *   `api/`: Server-side logic (e.g., `api/subscribe`).
*   `src/data/`: **The Database.**
    *   `events.json`: List of upcoming events.
    *   `past-events.json`: Concluded events with results.
    *   `subscribers.json`: Email list.
*   `src/types/`: TypeScript definitions (`event.ts`).
*   `public/`: Static assets (images, PDF notices).

### Data Management Rules
1.  **Read-Modify-Write:** To "update the database", you MUST read the relevant JSON file, modify the array/object in memory, and write the entire file back.
2.  **Strict Typing:** All data entries must strictly adhere to interfaces in `src/types/event.ts`.
3.  **IDs:** Use slug-based IDs: `YYYY-MM-DD-event-name` (e.g., `2025-12-15-mtb-jammu`).
4.  **Assets:** Store images/PDFs in `public/` and reference them via root-relative paths (e.g., `/images/events/my-event.jpg`).

## 4. Development Workflow

### Standard Commands
*   `npm run dev`: Start local development server.
*   `npm run build`: Production build.
*   `npm run start`: Start production server.
*   `npm run lint`: Run code quality checks.

### Implementation Guidelines
*   **Styling:** Use Tailwind Utility classes. Define primary colors in `globals.css`. Make sure new components follow dark/light theme and use css modules as much as possible
*   **Components:** Small, focused functional components.
*   **Next.js Patterns:** Use Server Components by default. Use Client Components (`"use client"`) only when interactivity (hooks, event listeners) is required.
*   **API Documentation** for latest documentation on libraries use context7

## 5. Feature Roadmap
*   [ ] **Ride Groups:** Directory of local clubs (WhatsApp/Strava links).
*   [ ] **Training:** Guides, plans, and nutrition advice.
*   [ ] **Blog:** Markdown-based articles from pros.
*   [ ] **Associations:** Contact info for district sports representatives.
*   [ ] **Routes:** GPX/Strava route integration.

## 6. Agent Behavior & Style
*   **Conventions:** Mimic existing code style (formatting, naming).
*   **Safety:** Always check file contents (`read_file`) before modifying.
*   **Efficiency:** Combine shell commands where possible.
*   **Output:** Be concise. Do not summarize changes unless asked.
*   **Verification:** Run `npm run lint` or `npm run build` after significant changes to ensure integrity.
