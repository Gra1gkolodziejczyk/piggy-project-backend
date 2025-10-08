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
    echo "=== Building api-gateway ===" && \
    pnpm run build api-gateway && \
    echo "=== Building authentication ===" && \
    pnpm run build authentication && \
    echo "=== Building users ===" && \
    pnpm run build users && \
    pnpm prune --prod

# Vérification COMPLÈTE
RUN echo "=== Checking dist structure ===" && \
    ls -laR dist/apps/ && \
    echo "=== Checking main.js files ===" && \
    test -f dist/apps/api-gateway/main.js && echo "✅ api-gateway/main.js exists" || echo "❌ api-gateway/main.js MISSING" && \
    test -f dist/apps/authentication/main.js && echo "✅ authentication/main.js exists" || echo "❌ authentication/main.js MISSING" && \
    test -f dist/apps/users/main.js && echo "✅ users/main.js exists" || echo "❌ users/main.js MISSING" && \
    echo "=== Checking ecosystem.config.js ===" && \
    cat ecosystem.config.js && \
    echo "==========================="

ENV NODE_ENV=production

EXPOSE 4000

# Lance PM2 en mode verbose pour voir les logs
CMD ["sh", "-c", "pm2-runtime start ecosystem.config.js --log-date-format 'YYYY-MM-DD HH:mm:ss'"]
