# Riftwilds auth setup (database + email + Google)

Custom session auth (cookies + Prisma) — **not** NextAuth. Dev bypass on localhost stays available; production remains gated.

Related: [AUTH_ACCOUNT_REQUIRED.md](./AUTH_ACCOUNT_REQUIRED.md), [DEV_OVERRIDE.md](./DEV_OVERRIDE.md).

---

## What you already have vs what this adds

| Already in repo | Added / tightened |
|-----------------|-------------------|
| Prisma `User`, `Session`, `AuthAccount`, `EmailVerificationToken` | `codeHash` on verification rows |
| Email/password register + login + password reset | **Username** required at signup |
| Link-token verify (`/verify-email`) | **6-digit code** + **10-minute** expiry |
| Soft-gate: `PENDING_VERIFICATION` → `/verify-email` | Resend with rate limits |
| Google/Discord/Apple OAuth (env-gated) | **Google callback** fully wired |
| Local skip via `AUTH_SKIP_EMAIL_VERIFY=true` | Resend email helper (console fallback + on-screen codes in non-prod) |
| Dev bypass on `/login` + `/signup` | `/verify` alias → `/verify-email` |

---

## 1. Database

Prisma expects Postgres:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

`DIRECT_URL` is for migrations (Neon pooled URL → use the **direct** connection string).

### Option A — Neon (recommended)

1. In Cursor: **Settings → Tools & MCP → Neon → Connect** (OAuth). Without this, the Neon MCP cannot create projects for you.
2. Create a project in [console.neon.tech](https://console.neon.tech) (or via MCP after Connect).
3. Copy **pooled** connection string → `DATABASE_URL`.
4. Copy **direct** connection string → `DIRECT_URL`.
5. Locally:

```bash
npm run db:migrate
npx prisma generate
```

### Option B — Stripe Projects Postgres

Stripe CLI + Projects plugin can provision Postgres (`stripe projects search postgres`). Stripe CLI is **not** installed in this workspace by default — install from [Stripe CLI docs](https://docs.stripe.com/stripe-cli/install), then follow the Stripe Projects skill workflow.

### Option C — Local Docker Postgres

```bash
docker run --name rift-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=riftwilds -p 5432:5432 -d postgres:16
```

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/riftwilds
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/riftwilds
```

Then `npm run db:migrate`.

---

## 2. Env checklist

Copy from `.env.example` into `.env` / Vercel.

### Required for real accounts

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma runtime |
| `DIRECT_URL` | Prisma migrate |
| `SESSION_SECRET` | ≥32 chars; session crypto |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally; production origin |

### Email verification (production)

| Variable | Purpose |
|----------|---------|
| `AUTH_EMAIL_VERIFICATION_REQUIRED=true` | Force verify in non-prod too |
| `AUTH_SKIP_EMAIL_VERIFY=false` | Do not skip in production |
| `RESEND_API_KEY` | Send mail via [Resend](https://resend.com) |
| `EMAIL_FROM` or `RESEND_FROM` | e.g. `Riftwilds <noreply@yourdomain.com>` |

Without `RESEND_API_KEY`, the server **logs** the email body (including code/reset link) to the console — fine for local. Non-production APIs may also return `emailDelivery: "console"` plus the code/token for on-screen UX; production never returns those secrets.

### Google OAuth

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth secret |

Optional later: `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`, Apple vars (scaffold only).

### Local / preview safety

| Variable | Notes |
|----------|-------|
| `AUTH_SKIP_EMAIL_VERIFY=true` | Default in `.env.example` — skip verify locally |
| Dev bypass | Shown on localhost `/login` & `/signup` — see `DEV_OVERRIDE.md`. Blocked in true production. |

There is **no** `NEXTAUTH_SECRET` — this app does not use NextAuth. Use `SESSION_SECRET`.

---

## 3. How 10-minute verification works

1. User signs up with **username + email + password** (scrypt password hash).
2. If verification is required → `accountStatus = PENDING_VERIFICATION`.
3. Server mints:
   - **Link token** (random base64url) — hashed as `tokenHash`
   - **6-digit code** — hashed as `codeHash`
   - Shared `expiresAt` = **now + 10 minutes**
4. Email (Resend or console) includes **code + link** (`/verify-email?token=…`).
5. User enters code on `/verify-email` (or `/verify`) **or** opens the link.
6. After success → `emailVerifiedAt` set, status → `ACTIVE`, continue `/onboarding`.
7. **Resend**: `POST /api/auth/verify-email/resend` (signed-in). Cooldown ~45s; max 3 codes / 15 minutes.
8. Login while pending still issues a session but gameplay redirects to `/verify-email`.

Local tip: with verification forced on, register/resend JSON may include `verificationCode` / `verificationToken` when `NODE_ENV !== "production"`.

---

## 4. Enable Google login (step-by-step)

### Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → OAuth consent screen**
   - User type: External (or Internal for Workspace-only).
   - App name: Riftwilds; support email; save.
   - Scopes: leave defaults (`openid`, `email`, `profile` requested by the app).
   - Add test users while in Testing.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**.
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://your-production-domain.com`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/oauth/google/callback`
     - `https://your-production-domain.com/api/auth/oauth/google/callback`
4. Copy Client ID + Client Secret into `.env`:

```env
GOOGLE_CLIENT_ID=….apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=…
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Restart `npm run dev`. On `/login`, click **Google** → should redirect to Google, then back with a session.

Discord/Apple buttons stay disabled until their OAuth keys and callbacks are finished (authorize URL may exist; token exchange for Discord/Apple is not complete).

---

## 5. Resend (email) setup — 5 steps for real Gmail delivery

Without `RESEND_API_KEY`, verification and password-reset emails are **not sent to Gmail**. The server logs a console preview instead, and in non-production the UI / API may show the code or reset link on-screen (`emailDelivery: "console"`). Codes and tokens are **never** returned in production responses.

Also: `AUTH_SKIP_EMAIL_VERIFY=true` skips issuing a verification email on signup entirely (local default).

### Steps

1. Sign up at [resend.com](https://resend.com) and open **API Keys**.
2. Create an API key → paste into `.env` as `RESEND_API_KEY=re_…`.
3. Set a from address:
   - Quick test: leave unset (defaults to Resend’s `onboarding@resend.dev`) — can only send **to your own Resend account email**.
   - Real Gmail for any user: verify your domain in Resend, then set `EMAIL_FROM=Riftwilds <noreply@yourdomain.com>`.
4. For local signup verification, set `AUTH_SKIP_EMAIL_VERIFY=false` (and optionally `AUTH_EMAIL_VERIFICATION_REQUIRED=true`).
5. Restart `npm run dev`, request a verification or password reset, and confirm the message arrives in Gmail (check spam).

### Local password unlock (no Resend)

```bash
npx tsx scripts/auth/set-temp-password.ts --email you@example.com --password 'TempPass123!'
```

Then sign in at `/login` and change the password once Resend works. Forgot-password also shows an on-screen reset link in development when email is not configured.

---

## 6. Routes to test

| Route | What to check |
|-------|----------------|
| `/signup` | Username + email + password; Dev bypass still visible locally |
| `/login` | Email login + Google / Discord / Apple buttons |
| `/verify-email` or `/verify` | 6-digit code, resend, link token |
| `/onboarding` | After verify / skip-verify |
| `/api/auth/oauth/google` | Redirects when keys set; JSON hint when missing |
| `/api/auth/oauth/google/callback` | Completes Google login |

API companions: `POST /api/auth/register`, `login`, `verify-email`, `verify-email/resend`, `password-reset/*`.

---

## 7. Vercel

Set the same env vars in the Vercel project. Use Neon pooled + direct URLs. Set:

```env
AUTH_SKIP_EMAIL_VERIFY=false
AUTH_EMAIL_VERIFICATION_REQUIRED=true
NEXT_PUBLIC_APP_URL=https://your-domain.com
COOKIE_SECURE=true
```

Run migrations in deploy (`npm run start:prod` already runs `prisma migrate deploy`) or a CI migrate step.

---

## 8. MCP / Connect clicks you may need

| Integration | Action |
|-------------|--------|
| **Neon** | Cursor → Settings → Tools & MCP → **Connect** next to Neon (auth timed out in agent session until you connect). |
| **Zapier** | Not required for this auth stack. |
| **Stripe Projects** | Optional alternative to Neon; needs Stripe CLI installed separately. |

---

## Migrations

```bash
npm run db:migrate
# includes 20260722120000_email_verification_code (codeHash column)
```
