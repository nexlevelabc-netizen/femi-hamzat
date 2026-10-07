# Build the campaign site from the bundled source on Node 20.

FROM node:20-alpine

WORKDIR /app

# Copy the repository (bundle parts, restore script, configs).
COPY . .

# Unpack the application source from scripts/bundle/part-*.txt.
RUN node scripts/restore-source.mjs

# Upgrade npm to v11 (the newest line compatible with Node 20; the bundled
# npm 10.8.2 can exit 0 without installing on Alpine: "Exit handler never
# called"), then install from the lockfile including devDependencies (vite
# and esbuild run the build), with one retry for registry flakes. Finally
# verify the install really happened: fail here with the npm log if
# node_modules/.bin/vite is missing.
RUN npm install -g npm@11 \
    && (npm ci --include=dev --no-audit --no-fund || npm ci --include=dev --no-audit --no-fund) \
    && ls node_modules/.bin/vite \
    && node -e "console.log('vite version:', require('vite/package.json').version)"

# Build frontend and server.
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
