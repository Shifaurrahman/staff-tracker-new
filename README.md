# staff-tracker-new

# Staff Daily Updates — v1
**Arva Tech** · React + Vite + Tailwind CSS + Supabase + Vercel

---

## Architecture (100% Free)

```
Browser (React + Vite + Tailwind)
        ↓  @supabase/supabase-js  (no separate backend needed)
  Supabase (Postgres + Realtime)
        ↓  deployed to
     Vercel (free tier)
```

**Cost: $0/month** on free tiers.

---

## Quick Reference — Your Project

| Item | Value |
|------|-------|
| Supabase URL | `https://ghqvahhrijqzswxismre.supabase.co` |
| Supabase Region | Northeast Asia (Tokyo) |
| Vercel deploy | `https://your-app.vercel.app` (after deploy) |
| Admin password | set in `VITE_ADMIN_PASSWORD` |

---

## Step 1 — Supabase Setup

### 1.1 Project already created ✅
Your project at `https://ghqvahhrijqzswxismre.supabase.co` is healthy.

### 1.2 Run the SQL schema
1. Supabase Dashboard → **SQL Editor** (left sidebar `>_` icon)
2. Click **New query**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run**
5. Expected result: `Success. No rows returned.`

This creates:
- `staff` table — staff member names + colors
- `messages` table — all updates posted
- `replies` table — admin replies to messages
- `messages_full` view — joined view used by the frontend

### 1.3 Get your API keys
Dashboard → **Settings** → **API Keys** → **Legacy anon, service_role API keys** tab

- **anon public** key (starts with `eyJ...`) → use as `VITE_SUPABASE_ANON_KEY`

> ⚠️ Use the **Legacy anon key** (eyJ... format), NOT the new Publishable key.
> The `@supabase/supabase-js` v2 library expects the legacy JWT format.

### 1.4 Enable Realtime
Dashboard → **Database** → **Replication**
- Toggle ON for `messages` table
- Toggle ON for `replies` table

This enables live updates across all devices without page refresh.

---

## Step 2 — Local Development

### 2.1 Install dependencies
```bash
cd my-project

npm install
npm install @supabase/supabase-js date-fns
npm install -D tailwindcss@3 postcss autoprefixer
```

### 2.2 Create `.env.local`
Create a file named `.env.local` in the `my-project/` folder:

```
VITE_SUPABASE_URL=https://ghqvahhrijqzswxismre.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-full-anon-key-here
VITE_ADMIN_PASSWORD=admin2024
```

> ⚠️ `.env.local` is never committed to Git — it stays on your machine only.
> Vite only reads it on startup — restart `npm run dev` after any change.

### 2.3 Check `src/lib/supabase.js`
Make sure it looks like this (no extra options):

```js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)
```

### 2.4 Check `src/index.css`
Must start with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.5 Run the dev server
```bash
npm run dev
# → http://localhost:5173
```

Expected: Dark navy fullscreen identity gate — "Who are you today?"

---

## Step 3 — Deploy to Vercel

### Option A: GitHub + Vercel Dashboard (recommended)

1. Create a GitHub repo and push this project:
```bash
git init
git add .
git commit -m "Staff tracker v1"
git remote add origin https://github.com/your-username/staff-tracker.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo

3. Settings:
   - Framework: **Vite** (auto-detected)
   - Build command: `npm run build`
   - Output directory: `dist`

4. Add **Environment Variables**:
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://ghqvahhrijqzswxismre.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | your full eyJ... anon key |
   | `VITE_ADMIN_PASSWORD` | your chosen admin password |

5. Click **Deploy** → done!

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel

# When prompted:
# - Framework: Vite
# - Build command: npm run build
# - Output dir: dist

# Add env vars:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_ADMIN_PASSWORD

# Redeploy with env vars:
vercel --prod
```

---

## File Structure

```
my-project/
├── .env.local                  ← YOUR KEYS (never commit this)
├── .env.example                ← template (safe to commit)
├── vercel.json                 ← SPA routing fix for Vercel
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── supabase-schema.sql         ← run this in Supabase SQL Editor
├── README.md
│
└── src/
    ├── main.jsx                ← entry point
    ├── App.jsx                 ← root layout + data fetching
    ├── index.css               ← Tailwind directives
    │
    ├── lib/
    │   ├── supabase.js         ← Supabase client
    │   ├── db.js               ← all DB calls (staff/messages/replies)
    │   └── helpers.js          ← date utils, colors, constants
    │
    ├── hooks/
    │   └── useIdentity.js      ← identity stored in localStorage
    │
    └── components/
        ├── IdentityGate.jsx    ← fullscreen name picker (blocks app)
        ├── Header.jsx          ← top bar + identity chip + admin button
        ├── AddStaffModal.jsx   ← admin-only: add new staff
        ├── MessageInput.jsx    ← compose + post update
        ├── WeekNav.jsx         ← week ‹ / › navigation
        ├── MessageFeed.jsx     ← grouped-by-day message list
        └── MessageCard.jsx     ← single message + admin reply
```

---

## Features in v1

| Feature | Status |
|---------|--------|
| Multiple messages per person per day | ✅ |
| Admin + staff can post messages | ✅ |
| Admin can reply to any message | ✅ |
| Only admin can add staff members | ✅ |
| Forced name selection on first visit | ✅ |
| Switch identity from header | ✅ |
| Week navigation (browse past weeks) | ✅ |
| Mobile-friendly responsive layout | ✅ |
| Real-time updates via Supabase | ✅ |
| Week activity stats panel (desktop) | ✅ |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Legacy anon key (eyJ...) | `eyJhbGci...` |
| `VITE_ADMIN_PASSWORD` | Password to unlock Admin Mode | `admin2024` |

---

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| Blank white screen | `.env.local` missing or wrong keys → restart `npm run dev` |
| `@supabase/supabase-js` not found | Run `npm install @supabase/supabase-js` |
| Tailwind not loading (unstyled) | Run `npm install -D tailwindcss@3 postcss autoprefixer` |
| Supabase "Unhealthy" status | Free tier paused — go to dashboard and resume |
| ECONNREFUSED errors | No backend needed — only Supabase + `.env.local` required |
| Messages not appearing live | Enable Replication for `messages` + `replies` in Supabase |
| Wrong API key format | Use Legacy anon key (eyJ...), not the new Publishable key |

---

## Roadmap — v2 (coming next)

- [ ] Weekly summary alert if staff haven't posted in 7 days
- [ ] Staff profile pages
- [ ] Project / task tagging on updates
- [ ] Admin summary dashboard ("what's going on this week")
- [ ] WhatsApp integration (Whapi)