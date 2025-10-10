# Socratic · AI Thinking Coach

Socratic is an AI reasoning coach that guides teams through structured decision making. It enforces answer-delay guardrails, maps assumptions/options/evidence/risks, orchestrates asynchronous team rounds, and exports decision briefs with forecasting hygiene.

## Stack

- **Frontend**: Next.js 15 (App Router) · TypeScript · TailwindCSS · shadcn/ui · Framer Motion · TanStack Query · Zustand
- **Auth**: NextAuth (Email magic link + Google OAuth)
- **Backend**: Next.js Route Handlers & Server Components, Prisma, Zod, provider-agnostic LLM abstraction
- **Database**: PostgreSQL (Docker via `docker-compose`)
- **LLM**: Mock adapter by default, OpenAI adapter when `OPENAI_API_KEY` is present
- **Exports**: Markdown → PDF via `@react-pdf/renderer` (saved under `public/briefs`)
- **Tooling**: Docker, ESLint, Prettier, Vitest, Playwright, GitHub Actions

## Quickstart

```bash
npm ci
cp .env.example .env
# Update PLACEHOLDER values before starting the app.
npm run dev
```

In a second terminal, start Postgres via Docker Compose and apply the schema:

```bash
docker compose up db
npm run db:push
npm run db:seed
```

Navigate to <http://localhost:3000>. The landing page links to the demo workspace seeded by `prisma/seed.ts`.

## Environment variables

All variables live in `.env`. Placeholders must be replaced before production:

- `DATABASE_URL` — PostgreSQL connection string (required)
- `NEXTAUTH_SECRET` — 32+ character secret
- `NEXTAUTH_URL` — base URL for auth callbacks
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional Google OAuth
- `EMAIL_SERVER_*` + `EMAIL_FROM` — optional magic-link SMTP (required if enabling email login)
- `OPENAI_API_KEY` — enables the OpenAI adapter; mock adapter used otherwise
- `NOTION_TOKEN`, `SLACK_BOT_TOKEN`, `NOTION_DATABASE_ID` — integrations (stubs throw descriptive errors)
- Feature flags: `NEXT_PUBLIC_ENABLE_VOICE_CAPTURE`, `NEXT_PUBLIC_FEATURE_TEAM_HEATMAP`

Unset integrations render a configuration banner and surface a consistent message:

```
This feature requires configuration. Click Settings → Integrations
```

## Running locally

- `npm run dev` — start Next.js with hot reload
- `npm run db:push` / `npm run db:seed` — Prisma schema sync & seed question packs
- `npm run lint` — ESLint (Next + Tailwind + Prettier)
- `npm run format` — Prettier
- `npm run test` — Vitest unit/API tests
- `npm run test:e2e` — Playwright (placeholder; requires `npm run dev` in another terminal)

### Docker

```
docker compose up --build
```

The app runs on port `3000`, Postgres on `5434`.

## Testing

- **Unit tests** (`tests/unit/*`): evaluate reveal guardrails, bias detection, mapper normalization, and Brier scoring.
- **API tests** (`tests/api/*`): ensure route handlers enforce auth.
- **E2E tests** (`tests/e2e/*`): Playwright scaffolding with a skipped scenario until CI environments start the Next server.

`npm run ci` executes lint → unit tests → Playwright using the configuration in `.github/workflows/ci.yml`. CI artifacts include Playwright reports.

## Project structure

```
packages/
  core/          # shared zod schemas + domain types
  llm/           # LLM abstraction with mock + OpenAI adapters + prompts
src/
  app/           # Landing + authenticated app router routes
  components/    # UI + domain components (shadcn style)
  lib/           # helpers (prisma client, util functions)
  server/        # auth, authz, services, error helpers
integrations/    # Notion, Slack, Calendar stubs (throw descriptive TODOs)
prisma/
  schema.prisma  # domain model
  seed.ts        # default packs + demo decision
```

## Decision flow overview

1. **New Decision** — select pack, depth, optional team.
2. **Question Stream** — answer Socratic prompts; mapper normalises transcripts into the decision map.
3. **Answer-Delay** — `/api/decisions/:id/check-reveal` enforces reveal rules from the pack.
4. **Draft & Brief** — once unlocked, `/draft` calls the LLM mock/OpenAI adapter; `/brief` composes Markdown + PDF.
5. **Team Rounds** — `/api/rounds` manage async entries; heatmap summarises divergence.
6. **Forecasts & Reviews** — capture calibration with Brier scores, schedule reminders.

## Deployment

The Dockerfile builds the production bundle. Deploy by pushing the container to your preferred host or use a managed Next.js provider. (Future TODO: add Vercel + Docker runbook.)

## Known gaps / TODOs

- End-to-end Playwright scenario is scaffolded but marked `test.skip` until a dedicated test environment spins up the Next server.
- Team invitations & real-time updates are placeholders.
- Integrations (Notion, Slack, calendar) require implementation after configuring tokens.
- Voice capture & browser extension features are feature-flag placeholders.

Contributions welcome. Coach the thinking, not the answer.
