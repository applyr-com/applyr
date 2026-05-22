# Applyr — Product Requirements Document

## 1. Overview

**Applyr** is a web app that helps students find, qualify for, and apply to
scholarships faster. It pairs a hand-curated scholarship database with Claude-powered
matching and essay generation so a student can go from profile to a tailored draft
in minutes.

- **Platform:** Web (responsive, mobile-supported down to 375px)
- **Target user:** Students searching and applying for scholarships
- **Pricing hypothesis:** $19/month (to be validated in beta)

## 2. Problem

Scholarship applications are scattered, repetitive, and slow. Students don't know
which scholarships they qualify for, and rewriting essays for each one is a major
drop-off point. Applyr centralizes discovery, automates eligibility matching, and
drafts essays from the student's own experiences.

## 3. Goals

- Let a student build a reusable profile and a library of structured experiences.
- Surface a ranked list of scholarships the student actually qualifies for.
- Generate and refine tailored essay drafts grounded in the student's experiences.
- Track every application through a simple status pipeline.

## 4. Scope

### In scope (MVP — Applyr v1)

| Area | Description |
|---|---|
| Auth & Onboarding | Signup / login (Supabase Auth); basic profile form (name, major, GPA, state, demographics) |
| STAR Experience Builder | Conversational 4-question AI interview; Claude extracts and structures the experience; student confirms/edits the summary; experiences saved and tagged to the profile |
| Scholarship Database | ~100 hand-curated scholarships; fields for name, amount, deadline, eligibility, essay prompts, tags |
| Matching | Claude compares user profile against eligibility criteria; returns a ranked list of qualifying scholarships |
| Essay Generation | Student picks a scholarship, sees the prompt; Claude drafts a tailored essay from relevant STAR experiences + profile; student can read, edit, and copy |
| Application Tracker | Per-scholarship status: Saved / In Progress / Submitted / Won / Rejected |
| Dashboard | Matches found, applications in progress, upcoming deadlines |

### Out of scope (v1) — build later if users ask

Browser automation / auto-submit · Win/loss analytics · Referral system ·
Shareable win cards · Community feed · B2B / counselor tier ·
Scholarship alerts / email reminders · Letter of recommendation drafts

## 5. Key Features & Requirements

### 5.1 Auth & Onboarding
- Signup page: name, email, password → on success redirect to `/profile/setup`.
- Login page: email, password → on success redirect to `/dashboard`.
- Middleware protects all routes except `/auth/*`; unauthenticated users are
  redirected to login.
- Profile setup form: school, major, GPA, year, state, first-gen toggle,
  financial-need toggle.

### 5.2 STAR Experience Builder
- Category picker (6 categories: Leadership, Community Service, etc.).
- One-question-at-a-time chat-style interview (4 STAR questions) with progress dots.
- `POST /api/experiences/extract` sends category + answers to Claude, returns
  structured JSON (title, situation, task, action, result, tags).
- Confirmation screen lets the student edit each STAR field and adjust tags before
  saving to the `experiences` table.

### 5.3 Scholarship Database & Browse
- Browse page at `/scholarships`: scholarship card list, search input, filters by
  amount / deadline / major, filter chips.
- ~100 hand-curated scholarships seeded into the database.

### 5.4 Matching
- `POST /api/scholarships/match` sends user profile + scholarships to Claude,
  returns `{scholarship_id, score}` (0–100) per scholarship.
- Browse page calls match on load, stores scores, sorts descending by score.

### 5.5 Essay Generation & Editor
- `POST /api/essays/generate` sends scholarship prompt + profile + relevant
  experiences to Claude, returns essay text.
- Essay editor at `/scholarships/[id]/essay`: scholarship banner, prompt, editable
  textarea, word-count bar, tone selector, "experiences used" sidebar, refine input,
  regenerate button, status selector.
- `POST /api/essays/refine` sends current essay + feedback to Claude, returns an
  updated essay.
- Every generate/refine writes to the `essays` table with an incremented version.

### 5.6 Application Tracker
- Per-scholarship status: 0 Saved · 1 In Progress · 2 Submitted · 3 Won · 4 Rejected.
- `/my-scholarships` page: summary stats, status filter chips, search; each card has
  a click-to-cycle status pill, generate-essay button, remove button.
- Add Custom Scholarship modal: name, org, amount, deadline, major, renewable,
  essay prompt, URL, notes; required-field validation; sets `is_custom = true`.

### 5.7 Dashboard
- Matches count, total $ available, deadlines this week, pipeline counts, recent
  activity, profile-completeness bar, quick-action buttons.

### 5.8 Experiences List
- `/experiences` page: all saved experiences as cards with STAR fields visible;
  edit, delete, and add buttons.

## 6. Tech Stack

| Layer | Choice |
|---|---|
| Frontend + Backend | Next.js (App Router) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| AI | Anthropic API (Claude Sonnet) |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |

## 7. Data Model

Seven core tables. Supabase Auth handles authentication; `users` stores profile
metadata auth doesn't cover.

- **users** — `id`, `email`, `name`, `created_at`
- **profiles** (1:1 with users) — `id`, `major`, `gpa`, `state`, `year`, `school`,
  `first_gen`, `financial_need`, `ethnicity`, `gender`, `updated_at`. This is what
  the matching algorithm reads.
- **experiences** (1:many) — `id`, `user_id`, `category`, `title`, `situation`,
  `task`, `action`, `result`, `tags[]`, `created_at`
- **scholarships** — `id`, `name`, `organization`, `amount`, `deadline`,
  `renewable`, `major`, `gpa_min`, `eligibility`, `essay_prompt`, `tags[]`, `url`,
  `is_custom`, `created_by` (nullable), `created_at`. `is_custom` + `created_by`
  cover both seeded and user-added scholarships in one table.
- **applications** (join table) — `id`, `user_id`, `scholarship_id`, `status`,
  `match_score`, `saved_at`, `updated_at`. Every saved/applied scholarship lives here.
- **essays** (1:many per application) — `id`, `user_id`, `application_id`,
  `content`, `word_count`, `version`, `created_at`, `updated_at`. Linked to
  applications, not scholarships, to support multiple drafts per scholarship.

**Relationships:** `users` → `profiles` (1:1), `experiences` (1:many),
`applications` (1:many) → `essays` (1:many), and `scholarships` (1:many, custom only).

## 8. Milestones

| Week | Focus | Deliverables |
|---|---|---|
| 1 (May 12–18) | Foundation | Repo, Vercel deploy, Supabase project + schema, Supabase client helpers, signup/login, route middleware, app shell + sidebar, ScholarshipCard & StatusBadge components, seed data |
| 2 (May 19–25) | Profile & Matching | Profile setup form, STAR interview UI, extract API, experience confirmation, scholarship browse page, match API + wired scores. End-to-end test of signup → profile → matches |
| 3 (May 26–Jun 1) | Essay Generation | Generate & refine APIs, essay editor, essay versioning, dashboard, My Scholarships page, Add Custom Scholarship modal, Experiences list. Full-journey walkthrough |
| 4 (Jun 2–8) | Polish & Beta | Loading states, error handling + toasts, mobile responsiveness (375px), empty states, logo/favicon, live smoke test, 10-student beta + 3 screen-share sessions |

## 9. Success Metrics (Beta)

- Students complete the full flow: signup → profile → matches → essay draft.
- Beta feedback on three questions: what was confusing, would you use this weekly,
  would you pay $19/month.
- Confusion points identified via 3 unguided screen-share sessions; top issues fixed.