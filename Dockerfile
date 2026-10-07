# Build the campaign site from the bundled source on Node 20.

FROM node:20-alpine

WORKDIR /app

# Copy the repository (bundle parts, restore script, configs).
COPY . .

# Unpack the application source from scripts/bundle/part-*.txt.
RUN node scripts/restore-source.mjs

# Install dependencies and build frontend and server.
RUN npm install
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
