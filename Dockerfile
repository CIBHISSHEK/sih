# ── Build stage ─────────────────────────────────────────────────────────────
# Builds packages/shared, the API (TypeScript -> dist) and the web SPA
# (Vite -> static files). The API image then serves that static build itself,
# so web + API deploy as a single unit on one origin.
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Manifests first for better layer caching
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# --ignore-scripts: the root postinstall bootstraps a Python venv for the ML
# service, which isn't part of this image. Prisma client is generated below.
RUN npm ci --ignore-scripts

COPY . .

# The web build reads VITE_* at build time. Blank VITE_API_URL => the SPA
# calls the API on its own origin (which is how it's deployed here).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run prisma:generate \
 && npm run build -w packages/shared \
 && npm run build -w apps/api \
 && npm run build -w apps/web

# Prune to production dependencies for the runtime image
RUN npm prune --omit=dev --workspaces --include-workspace-root

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# openssl is required by Prisma's query engine at runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENV WEB_DIST_DIR=/app/apps/web/dist
ENV PORT=4000
EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/index.js"]
