# Backend setup — contact form, analytics, dashboard

Everything in this doc is optional. Without it, the site still works fully:
the contact form shows a friendly "use the email button instead" message,
and there's no analytics or dashboard. Nothing crashes, nothing looks broken.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open **Project Settings → API**. You'll need three values from this page.
3. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](../supabase/schema.sql), and run it. This creates
   two tables (`contact_messages`, `page_events`) with row-level security
   that only allows anonymous **inserts** — nobody can read, edit, or delete
   through the public key, only your service-role key can.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=             # Project Settings -> API -> Project URL
VITE_SUPABASE_ANON_KEY=        # Project Settings -> API -> anon public key
SUPABASE_SERVICE_ROLE_KEY=     # Project Settings -> API -> service_role secret (keep secret!)
DASHBOARD_ALLOWED_EMAIL=       # your email — the only one allowed into /dashboard
```

Restart `npm run dev` after editing `.env`. The contact form on the home
page will start actually submitting instead of showing the fallback
message, and `/dashboard` will let you sign in.

## 3. (Optional) Email notifications via Resend

Contact messages are always saved to Supabase regardless of this step —
this only adds an email ping when one arrives.

1. Create a free account at [resend.com](https://resend.com) and get an API key.
2. Add to `.env`:

```
RESEND_API_KEY=
CONTACT_NOTIFY_EMAIL=          # where the notification email goes — your inbox
```

The sender address (`onboarding@resend.dev`) is Resend's shared sandbox
domain, good enough for low-volume notification email. Verify your own
domain in Resend later if you want mail to come from `you@yourdomain.com`
(`src/server/resend.ts` — change the `from` field once you do).

## 4. Set up dashboard sign-in (Supabase Auth)

The dashboard at `/dashboard` uses Supabase Auth's magic-link email sign-in,
restricted to `DASHBOARD_ALLOWED_EMAIL`. No extra setup needed beyond having
a Supabase project — magic links are enabled by default. Go to
**Authentication → URL Configuration** in the Supabase dashboard and add
your site's URL (e.g. `http://localhost:3000` while developing, your real
domain once deployed) to the allowed redirect URLs.

## What's cookie-less about the analytics

`page_events` records only a path, an optional referrer, and a timestamp —
no cookie, no localStorage id, no fingerprint, no cross-session
correlation. It can tell you which pages get visited, not who visited them
or when the same person came back. Tracking is skipped entirely while
running `npm run dev`, so your own testing never pollutes real numbers.

## Deploying

None of this requires a specific host. TanStack Start builds to a
standard Node server (`dist/server/server.js`) plus a static client bundle
(`dist/client/`) — any platform that runs Node works (Vercel, Netlify,
Railway, Fly.io, a VPS). Set the same environment variables in your host's
dashboard that you set in `.env` locally. Actually deploying is a separate,
deliberate step — ask before pushing anything live.
