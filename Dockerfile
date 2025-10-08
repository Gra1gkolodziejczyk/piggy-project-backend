FROM node:20-alpine

WORKDIR /app

# Installation de pnpm et PM2
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    npm install -g pm2

# Copie des fichiers
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY ecosystem.config.js ./
COPY apps ./apps
COPY libs ./libs

# Installation et build de TOUS les services
RUN pnpm install --frozen-lockfile && \
    echo "Building api-gateway..." && \
    pnpm run build api-gateway && \
    echo "Building authentication..." && \
    pnpm run build authentication && \
    echo "Building users..." && \
    pnpm run build users && \
    pnpm prune --prod

# Vérification
RUN echo "=== Checking dist structure ===" && \
    ls -la dist/apps/ && \
    echo "==========================="

ENV NODE_ENV=production

# Expose le port de l'API Gateway
EXPOSE 4000

# Lance PM2 avec les 3 applications
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
