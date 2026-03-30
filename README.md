# Debatica

Debatica is an AI-assisted debate workspace for research, evidence extraction, rebuttal generation, case organization, and speech review.

It was built as a product repo, not just a prompt collection. The goal is to reduce the manual overhead in debate prep while keeping the workflow structured enough to save and reuse work.

## What it does

- Cuts cards from web and PDF sources
- Generates rebuttals and flow support
- Organizes cases and research notes
- Reviews speeches and word choice
- Supports extemp prep workflows
- Connects to Google Drive and Docs for source material

## Stack

- Next.js 14 and TypeScript
- NextAuth, Prisma, and Supabase
- OpenAI and Gemini routing
- Prompt templates in `prompts/`
- App Router API endpoints in `app/api/`

## Repo map

- `app/` contains the UI and API routes
- `components/` holds the shared React components
- `lib/` contains auth, model routing, and Google integrations
- `prompts/` keeps task-specific prompt templates
- `prisma/` contains the schema and seed logic

## Setup

```bash
pnpm install
cp env.example .env.local
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000` after the dev server starts.

## Environment

You need values for Supabase, NextAuth, OpenAI, Gemini, and Google OAuth before the full app is live. Start from `env.example` and use the setup notes in `GOOGLE_CLOUD_SETUP.md` and `GOOGLE_DRIVE_SETUP.md` for the Google integrations.

## Available scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

## Notes

- This repository is the product codebase and case study for Debatica
- The app expects real service credentials before uploads, history, and Google integrations are fully live
