# AI Welfare Assistant

A conversational AI welfare assistant for university student support. Students chat in natural language; the server triages each message, applies safeguarding house rules in code, and either answers from a knowledge base, asks a clarifying question, or escalates to staff.

## Live demo

Deploy with `vercel deploy`, then set your production URL here (e.g. `https://your-app.vercel.app`).

## Staff login (assessment)

- URL: `/dashboard/login`
- Email: `staff@example.com`
- Password: `StaffPass123!`

## Local setup

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key for Gemini

### 1. Clone and install

```bash
git clone <your-repo-url>
cd eduinuk_assisment
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL=postgresql://...-pooler...?sslmode=require
GOOGLE_GENERATIVE_AI_API_KEY=your-key
GEMINI_MODEL=gemini-3-flash-preview
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL=http://localhost:3000
```

Use Neon's **pooled** connection string (hostname contains `-pooler`).

### 3. Database

```bash
npm run db:migrate
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000/chat](http://localhost:3000/chat) for the student experience, or [http://localhost:3000/dashboard/login](http://localhost:3000/dashboard/login) for staff.

### 5. Verify auth

```bash
curl http://localhost:3000/api/auth/ok
# → {"status":"ok"}
```

### 6. Test house rules

```bash
npx tsx scripts/test-scenarios.ts
```

## Architecture

```
Student message → POST /api/chat
  → save user message
  → Gemini generateObject (triage)
  → Zod validation + house-rules engine (server overrides)
  → save triage result
  → if escalate: create case in staff queue
  → streamText response (grounded in KB for handle_now)
  → save assistant message
```

**Stack:** Next.js 16, Neon PostgreSQL, Drizzle ORM, Better Auth, Gemini via Vercel AI SDK, AI Elements + shadcn/ui.

The staff dashboard is server-rendered (RSC) with a server action for case status updates — no client-side data-fetch waterfalls.

## Known limitation (assessment build)

Staff sign-up via email/password is enabled for easy local setup. In production this would be disabled (`disableSignUp: true`), with invite-only staff accounts and role-based access on dashboard routes.

## Deploy to Vercel

1. Push to GitHub and import in [Vercel](https://vercel.com).
2. Add environment variables (`DATABASE_URL`, `GOOGLE_GENERATIVE_AI_API_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` = your production URL).
3. Run migrations against production: `npm run db:migrate`
4. Seed staff: `npm run db:seed`

## Assessment questions

### If this served 50 organisations and 10,000 conversations a day, what would you change?

I'd introduce multi-tenant isolation (organisation ID on every row), dedicated async workers for triage and escalation rather than handling everything in the request path, rate limiting per org and per IP, and caching for knowledge-base retrieval. I'd add observability (structured logs, triage audit trail, alerting on safeguarding spikes), model routing (fast model for triage, separate quotas), and horizontal scaling of the Postgres layer with read replicas for the staff dashboard. Conversation storage would move to partitioned tables or time-based archival so the database stays performant at volume.

### This is real students' personal and welfare data. What would you do differently for privacy and safety in a production version?

I'd encrypt data at rest and in transit, enforce strict retention and deletion policies, minimise what's stored (no unnecessary PII in logs), and run on infrastructure with proper DPAs. Staff access would be role-based with audit logs. Safeguarding cases would have tighter access controls and faster human review SLAs. I'd add content moderation on inputs/outputs, regular penetration testing, and clear privacy notices explaining how conversations are used. API keys and secrets would live in a managed secrets store, not environment files in CI.

### How does the assistant decide what to answer itself and what to escalate?

Every message is classified by AI into a category, urgency, and a suggested action — but the server always applies fixed safety rules on top. Routine questions that match our knowledge base (like finding library resources) get a direct, helpful reply. Vague messages get one or two clarifying questions. Anything involving crisis, safeguarding, immigration advice, legal issues, harassment, or cases the knowledge base can't cover is always passed to a human, with emergency numbers shown when someone may be in immediate danger. When the system is unsure, it escalates rather than guessing.

## Submission notes

- Spam/jailbreak messages are declined safely and do **not** create staff cases (by design).
- Immigration questions always escalate; the assistant may link to GOV.UK but never advises on individual circumstances.
- KB sources appear only on grounded `handle_now` replies (not on escalate/clarify).
- All 8 test messages from the assessment brief are covered in `scripts/test-scenarios.ts`.
