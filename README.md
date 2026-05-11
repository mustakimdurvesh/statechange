# StateChange

**Know before you go.** StateChange tells you whether you need a visa, can get one on arrival, or can travel visa-free — instantly, for any country pair.

🌐 **Live:** [statechange-theta.vercel.app](https://statechange-theta.vercel.app)

---

## What it does

Enter a passport country and a destination country. StateChange checks the visa requirement for that route and returns one of three verdicts:

- **Free** — no visa required
- **VoA** — visa on arrival available
- **Visa** — advance visa required

Every search is logged anonymously for analytics, and travelers can leave community reports with firsthand context for any route.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| AI / LLM | Groq API (fast inference) |
| Database | Supabase (Postgres + RLS) |
| Serverless API | Vercel Functions (`/api`) |
| Deployment | Vercel |

---

## Project structure

```
statechange/
├── api/
│   └── check.js          # Vercel serverless function — calls Groq, logs to Supabase
├── public/               # Static assets
├── src/                  # React app
├── supabase-schema.sql   # Full DB schema with RLS policies and analytics views
├── .env.example          # Environment variable reference
├── vercel.json           # Vercel routing config
└── vite.config.js
```

---

## Database schema

Two tables power the app:

**`searches`** — every route check, logged for analytics
```sql
id, from_code, to_code, verdict, user_id, created_at
```

**`community_reports`** — traveler-submitted firsthand accounts
```sql
id, from_code, to_code, passport, report_text, tags[], flagged, user_id, created_at
```

Two analytics views are also included:
- `popular_routes` — aggregated search counts by verdict
- `route_report_counts` — community activity per route

Row-level security is enabled on both tables. Anonymous users can insert and read unflagged reports; the service key (server-side only) handles privileged access.

---

## Local setup

**Prerequisites:** Node.js 18+, a Groq API key, a Supabase project.

### 1. Clone and install

```bash
git clone https://github.com/mustakimdurvesh/statechange.git
cd statechange
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set:

```env
GROQ_API_KEY=your-groq-api-key-here
```

Get your Groq key at [console.groq.com](https://console.groq.com) → API Keys.

The Supabase publishable key is hardcoded in `src/lib/supabase.js` and `api/check.js` — update those files with your project's URL and anon key.

### 3. Set up the database

In your Supabase project, open the SQL editor and run the contents of `supabase-schema.sql`. This creates both tables, all indexes, RLS policies, and the analytics views.

### 4. Run locally

```bash
npm run dev
```

The app runs at `http://localhost:5173`. To test the serverless API function locally, use the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npx vercel dev
```

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Set `GROQ_API_KEY` as an environment variable in your Vercel project settings (Dashboard → Project → Settings → Environment Variables).

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Server-side only. Never expose to the client. |

Supabase credentials are publishable (anon key + project URL) and are safe to include in client-side code. RLS policies enforce data access rules at the database level.

---

## Contributing

Community reports are the backbone of what makes this useful. If you've traveled a route recently and the official verdict doesn't tell the full story, submit a report directly from the app.

For code contributions: fork, branch, PR. Keep the serverless function lean and make sure any new DB access respects the existing RLS policies.

---
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## License

MIT
