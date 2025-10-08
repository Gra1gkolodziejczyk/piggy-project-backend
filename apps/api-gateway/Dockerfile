# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 2: Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Stage 3: Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps
COPY libs ./libs

# Build avec logs pour vérifier
RUN echo "Building api-gateway..." && \
    pnpm run build api-gateway && \
    echo "Build completed, checking dist folder:" && \
    ls -la dist/ && \
    ls -la dist/apps/ && \
    ls -la dist/apps/api-gateway/ || echo "No api-gateway folder"

# Stage 4: Runner
FROM base AS runner

# Variables d'environnement
ENV NODE_ENV=production

# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copie des fichiers nécessaires
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Debug: Affiche la structure
RUN echo "=== Checking dist structure ===" && \
    ls -la dist/ && \
    echo "=== Checking dist/apps ===" && \
    ls -la dist/apps/ || echo "No apps folder" && \
    echo "=== Checking dist/apps/api-gateway ===" && \
    ls -la dist/apps/api-gateway/ || echo "No api-gateway folder" && \
    echo "==========================="

USER nestjs

EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# CMD avec chemin correct
CMD ["node", "dist/apps/api-gateway/main.js"]
