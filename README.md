# Femi Hamzat 2027 Campaign Website

Full stack campaign platform for Dr Kadri Obafemi Hamzat, APC candidate for Governor of Lagos State 2027.

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Hono + tRPC 11 API (endpoints under /api/trpc)
- Drizzle ORM + PostgreSQL (Neon)
- Kimi OAuth (platform provided) for the /admin dashboard

## Local development

```bash
npm install
cp .env.example .env   # fill in real values
npm run db:push        # create tables in your Postgres database
npx tsx db/seed.ts     # load articles, events and achievements
npm run dev            # http://localhost:3000
```

## How the source is stored (important)

The full application source (src, api, contracts, db and all root config files) is
packed inside `scripts/bundle/` as base64 text parts. During the build,
`scripts/restore-source.mjs` joins the parts, decodes the archive and extracts the
source tree, so a plain clone of this repository builds into the complete site.

The image files in `public/images` are binary and therefore not part of the bundle.
Before the first deploy, upload them through the GitHub web interface:

1. Open the repository on github.com and browse to the `public` folder
   (create it with Add file, then Create new file named `public/images/.gitkeep`
   if it does not exist).
2. Open `public/images`, choose Add file, then Upload files, and drag in every
   image from your local `public/images` folder (apc-logo.jpg, hamzat-portrait.jpg
   and the rest). Commit the upload.

## Deploy on Render

1. Complete the image upload above so `public/images` exists in the repository.
2. On render.com choose New, then Web Service, then connect the repository.
   A `render.yaml` is included, so Render pre fills the settings:
   - Runtime: Node
   - Build Command: `node scripts/restore-source.mjs && npm install && npm run build`
   - Start Command: `npm start`
   - Node version: 20
3. Add the environment variables from .env.example (see notes below).
4. Use your Neon Postgres database. In the Neon dashboard open your project,
   choose Connect, and copy the pooled connection string (it ends with
   `sslmode=require`). Set it as DATABASE_URL on Render.
5. After the first deploy, open the Render Shell for the service and run once:

```bash
npm run db:push && npx tsx db/seed.ts
```

The site then serves live content from the database.

## Environment variables

See .env.example. Notes:

- DATABASE_URL must point to a Postgres database (Neon recommended). All pages read content from it.
- APP_ID, APP_SECRET, KIMI_AUTH_URL, KIMI_OPEN_URL, OWNER_UNION_ID power the Kimi sign in used by /admin. These are issued by the Kimi platform. Outside the platform you can set placeholder values so the server boots, but the admin login will only work where those credentials are real.
- VITE_APP_ID and VITE_KIMI_AUTH_URL are compile time values for the login page only.

## Deploy on Vercel

Not recommended: the app is a long running Node server (Hono), not a set of serverless functions. Use Render, Railway or any Node host instead.
