# grant.ai — ҰБТ / ЕНТ preparation platform

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + lucide-react. Locales: `kk` (default) and `ru`.

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /kk
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` for canonical URLs, sitemap, RSS and Open Graph.

## Where things live

| Path | What |
| --- | --- |
| `src/content/unt-config.ts` | **All official ҰБТ numbers** (format, subject pairs, thresholds, sessions, grants), each with `source` + `verifiedAt`. Re-check every January. |
| `src/content/questions.ts` | Original practice questions (history, maths literacy, reading, profile maths/physics) |
| `src/content/*.ts` | Bilingual content: tools, guides, games, quiz, home, legal, shared UI strings (`ui.ts`) |
| `src/app/[locale]/(site)` | Full-shell routes |
| `src/app/[locale]/(minimal)` | Quiz and login |
| `src/lib/i18n.ts` | Locale helpers (`lp`, `swapLocale`, `L` type) |

## Values marked VERIFY in unt-config.ts

Partial credit on 2-point tasks, per-exam maximum for creative exams, +40 min extra time, allowed materials, and the January / March / August session dates. 2027 dates are `null` until the NTC announces them.

## Placeholders to replace before launch

`[COMPANY NAME]`, `[BIN]`, `[ADDRESS]`, `[SUPPORT EMAIL]`, `[PARTNERS EMAIL]`, `[REVIEW]`, `[RATING]`, `[SCORE]`, `[GRANT CUT-OFF]`, `[OFFER]`, `[PRICING]`, `[GUARANTEE TERMS]`, `[LEGAL COPY]`, `[GUIDE COPY]`, `[UNIVERSITY nn]` directory rows, `[AUTH PROVIDER]`, `[SMS PROVIDER]`. Email/SMS capture and login are UI only.

## Grant data (2025)

`src/content/data/programs.json` and `universities.json` hold the 2025 grant-competition results (general competition + rural quota) for 104 programme groups and 125 universities, collected from univision.kz on 2026-11-14. When the 2026 results are published, re-run the scraper scripts and replace both files.

## Sending the plan by email

The quiz posts to `/api/send-plan`, which sends through [Resend](https://resend.com). Copy `.env.example` to `.env.local` and set `RESEND_API_KEY` and `PLAN_FROM_EMAIL` (a sender on a domain verified in Resend). Without a key the quiz still opens the plan page and shows that email isn't configured.

## Accounts

Email + password accounts (scrypt-hashed passwords, httpOnly session cookie, 30 days). Signed-in users get their plan, roadmap progress and mock-test history saved on the server and restored on any device; guest data is merged into the account on first sign-in.

- Storage: SQLite via Node's built-in `node:sqlite`, file `./data/grantai.db` (git-ignored). Set `GRANTAI_DB_PATH` to move it.
- API: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET|PUT|DELETE /api/me`.
- Pages: `/kk/login` (sign in / register), `/kk/account` (cabinet, logout, delete account).
- For a public deployment, use a persistent disk or swap `src/lib/server/db.ts` for a managed database, and serve over HTTPS (cookies are `Secure` in production).
