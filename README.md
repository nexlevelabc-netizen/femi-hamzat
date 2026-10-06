# Femi Hamzat 2027 Campaign Website

Full stack campaign platform for Dr Kadri Obafemi Hamzat, APC candidate for Governor of Lagos State 2027.

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Hono + tRPC 11 API (endpoints under /api/trpc)
- Drizzle ORM + MySQL
- Kimi OAuth (platform provided) for the /admin dashboard

## Local development

```bash
npm install
cp .env.example .env   # fill in real values
npm run db:push        # create tables in your MySQL database
npx tsx db/seed.ts     # load articles, events and achievements
npm run dev            # http://localhost:3000
```

## Deploy on Render

1. Push this code to your GitHub repository (all folders: api, contracts, db, public, src, plus every root config file). Do not commit .env or node_modules.
2. On render.com choose New, then Web Service, then connect the repository.
3. Settings:
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Node version: 20
4. Add the environment variables from .env.example (see notes below).
5. Provision a MySQL 8 database. Render does not include MySQL, so use an external MySQL provider (Aiven, PlanetScale, Railway) and set DATABASE_URL to its connection string.
6. After the first deploy, open the Render Shell for the service and run once:

```bash
npm run db:push && npx tsx db/seed.ts
```

The site then serves live content from the database.

## Environment variables

See .env.example. Notes:

- DATABASE_URL must point to a MySQL 8 database. All pages read content from it.
- APP_ID, APP_SECRET, KIMI_AUTH_URL, KIMI_OPEN_URL, OWNER_UNION_ID power the Kimi sign in used by /admin. These are issued by the Kimi platform. Outside the platform you can set placeholder values so the server boots, but the admin login will only work where those credentials are real.
- VITE_APP_ID and VITE_KIMI_AUTH_URL are compile time values for the login page only.

## Deploy on Vercel

Not recommended: the app is a long running Node server (Hono), not a set of serverless functions. Use Render, Railway or any Node host instead.
