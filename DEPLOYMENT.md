# StudyFlow — Deployment Guide

Deploy **StudyFlow** with:

| Service | Role |
|---------|------|
| **Supabase** | Database, user accounts, cloud workspace sync |
| **Google Gemini** | AI Assistant (`/chat`) |
| **Vercel** *(recommended)* or **Render** | Host the Next.js website |

---

## What you need before starting

- A [GitHub](https://github.com) account (to connect Vercel/Render)
- A [Supabase](https://supabase.com) account (free tier is fine)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key for Gemini
- Node.js 20+ locally (optional, for testing)

---

## Part 1 — Supabase (database + auth + cloud storage)

### Step 1: Create a project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Pick a name (e.g. `studyflow`), set a database password, choose a region close to your users
4. Wait until the project status is **Active**

### Step 2: Run the workspace SQL migration

1. In Supabase, open **SQL Editor** → **New query**
2. Copy the entire file `supabase/workspace_migration.sql` from this repo and paste it
3. Click **Run**
4. You should see success — this creates `user_workspaces` with row-level security (each user only sees their own data)

### Step 3: (Optional) Run full schema

If you want calendar/notes tables for future features, also run `database_schema.sql` in the SQL Editor.  
**Cloud sync for pages and tasks only needs `workspace_migration.sql`.**

### Step 4: Get API keys

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Keep **service_role** secret — do not put it in the browser or commit it

### Step 5: Configure Auth URLs (do this after you know your live URL)

You will update this again after Vercel/Render gives you a domain.

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production URL, e.g. `https://studyflow.vercel.app`
3. Under **Redirect URLs**, add:
   ```
   https://YOUR-DOMAIN.vercel.app/auth/callback
   https://YOUR-DOMAIN.vercel.app/**
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
4. If using Render, also add `https://YOUR-APP.onrender.com/auth/callback`

### Step 6: Enable email auth

1. **Authentication** → **Providers** → **Email**
2. Ensure **Enable Email provider** is on
3. For production, configure **SMTP** under Project Settings → Auth if you want custom emails (optional on free tier)

---

## Part 2 — Google Gemini (AI Assistant)

### Step 1: Create an API key

1. Open [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with Google
3. Click **Create API key** (use an existing Google Cloud project or create one)
4. Copy the key → this is `GEMINI_API_KEY`

### Step 2: Billing (if required)

- Gemini has a free tier; some accounts need billing enabled in Google Cloud
- If AI returns errors in production, check [Google AI Studio usage](https://aistudio.google.com/)

### Step 3: Restrict the key (recommended)

In Google Cloud Console → **APIs & Services** → **Credentials**:

- Restrict key to **Generative Language API**
- Add HTTP referrer restrictions only if you call Gemini from the browser (this app calls it **server-side** from `/api/ai`, so server IP / no referrer restriction is typical)

---

## Part 3 — Push code to GitHub

### Step 1: Initialize git (if not already)

From the repository root (where `package.json` lives):

```bash
cd "d:\productivity app"
git add .
git commit -m "Prepare StudyFlow for deployment"
```

### Step 2: Create GitHub repo

1. [github.com/new](https://github.com/new) → create repository (e.g. `studyflow`)
2. Push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/studyflow.git
git branch -M main
git push -u origin main
```

**Important:** Do not commit `.env.local` — it is gitignored. Use `.env.example` as a template.

---

## Part 4 — Deploy on Vercel (recommended)

### Step 1: Import project

1. Go to [https://vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repository
3. **Root Directory** must be empty (`.` / repo root) — `package.json` and `next.config.ts` are at the top level.
4. Framework should auto-detect **Next.js**

### Step 2: Environment variables

In Vercel → **Settings** → **Environment Variables**, add for **Production**, **Preview**, and **Development**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase → API (anon) |
| `GEMINI_API_KEY` | From Google AI Studio |

### Step 3: Deploy

1. Click **Deploy**
2. Wait for build to finish
3. Copy your URL, e.g. `https://studyflow-xxx.vercel.app`

### Step 4: Update Supabase redirect URLs

Go back to Supabase **Authentication** → **URL Configuration** and set:

- **Site URL:** `https://studyflow-xxx.vercel.app`
- **Redirect URLs:** include `https://studyflow-xxx.vercel.app/auth/callback`

### Step 5: Verify

1. Open your Vercel URL
2. Top banner should say **“Saved on this device only”** until you sign in
3. Go to **Sign in** → create account → after login, banner should say **“Synced to cloud”**
4. Open **AI Assistant** → send a message → you should get a reply

---

## Part 5 — Deploy on Render (alternative)

Use this if you prefer Render over Vercel.

### Step 1: New Web Service

1. [https://dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect the same GitHub repo
3. Settings:
   - **Root Directory:** leave empty (repo root)
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance type:** Free (or paid for always-on)

Or use the included `render.yaml` blueprint: **New** → **Blueprint** → select repo.

### Step 2: Environment variables

Add the same three variables as Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

Optional: `NODE_VERSION` = `20`

### Step 3: Deploy and configure Supabase

1. After deploy, copy your Render URL (`https://something.onrender.com`)
2. Add that URL to Supabase **Redirect URLs** and **Site URL** (same as Vercel step)

**Note:** Free Render apps spin down after inactivity; first load may be slow.

---

## Part 6 — Local development

```bash
cd "productivity app"
cp .env.example .env.local
# Edit .env.local with your Supabase + Gemini keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment variables reference

| Variable | Required | Where used |
|----------|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for cloud sync) | Browser + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for cloud sync) | Browser + server |
| `GEMINI_API_KEY` | Yes (for AI) | Server only (`/api/ai`) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Admin scripts only — never expose publicly |

---

## How data is stored in production

| Feature | Storage |
|---------|---------|
| Not signed in | Browser `localStorage` only |
| Signed in | **Supabase** table `user_workspaces` (JSON per user) + local cache |
| AI chats | Not persisted yet (session only) |
| Auth | Supabase Auth |

When someone visits your deployed site and signs up, their pages and tasks are stored in **your Supabase project**, isolated by user ID (RLS policies).

---

## Troubleshooting

### “Cloud save failed” banner

- Run `supabase/workspace_migration.sql` in SQL Editor
- Confirm env vars on Vercel/Render match Supabase project
- Redeploy after changing env vars

### AI: “Gemini API key not configured”

- Add `GEMINI_API_KEY` on Vercel/Render
- Redeploy

### AI: rate limit / 429

- Wait and retry, or enable billing in Google Cloud

### Auth: email link doesn’t work

- Check Supabase **Redirect URLs** include `https://YOUR-DOMAIN/auth/callback`
- **Site URL** must match your live domain

### Vercel shows NOT_FOUND (404)

- **Root cause:** Vercel built the wrong folder (no `package.json` at project root).
- **Fix:** Project Settings → General → **Root Directory** = empty (not `studyflow`). Redeploy.
- Confirm **Build** logs show `next build` and routes like `/`, `/auth`, `/api/ai`.

### Build fails on Vercel

- Root Directory must be repo root (where `package.json` lives)
- Use Node 20 (default on Vercel is fine)

### Render: app sleeps

- Upgrade plan or use Vercel for hobby projects

---

## Quick checklist

- [ ] Supabase project created
- [ ] `workspace_migration.sql` executed
- [ ] Supabase URL + anon key copied
- [ ] Gemini API key created
- [ ] Code pushed to GitHub
- [ ] Vercel or Render deployed with 3 env vars
- [ ] Supabase Site URL + Redirect URLs updated to production domain
- [ ] Sign up on live site → “Synced to cloud” appears
- [ ] AI Assistant responds

---

## Architecture diagram

```
User browser
    │
    ├─► Vercel / Render (Next.js)
    │       ├─► /api/ai  ──► Google Gemini
    │       └─► pages, auth callback
    │
    └─► Supabase (direct from browser)
            ├─► Auth (sign up / sign in)
            └─► user_workspaces (pages, tasks, history)
```

You only need **one** host (Vercel **or** Render), plus **Supabase** and **Gemini**.
