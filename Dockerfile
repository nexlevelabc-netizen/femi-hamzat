# Build the campaign site from the bundled source on Node 20.

FROM node:20-alpine

WORKDIR /app

# Copy the repository (bundle parts, restore script, configs).
COPY . .

# Unpack the application source from scripts/bundle/part-*.txt.
RUN node scripts/restore-source.mjs

# Install dependencies (including devDependencies: vite and esbuild are
# needed for the build, and Render sets NODE_ENV=production during builds).
RUN npm install --include=dev

# Build frontend and server.
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
