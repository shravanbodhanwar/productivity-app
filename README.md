# StudyFlow

A Notion-style study workspace: pages, task boards, calendar, Pomodoro timer, and Gemini AI assistant.

## Local setup

```bash
npm install
cp .env.example .env.local
# Fill in Supabase + Gemini keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to production

**Full step-by-step guide:** see **[DEPLOYMENT.md](./DEPLOYMENT.md)** (Vercel, Render, Supabase, AI).

## Tech stack

- Next.js 16 · React 19 · Tailwind CSS 4
- Supabase (auth + cloud workspace)
- Google Gemini 2.0 Flash (AI)
- TipTap block editor
