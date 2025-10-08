FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps
COPY libs ./libs

# Install et build TOUS les services
RUN pnpm install --frozen-lockfile && \
    pnpm run build api-gateway && \
    pnpm run build authentication && \
    pnpm run build users && \
    pnpm prune --prod

ENV NODE_ENV=production

# Script pour lancer les 3 services en parallèle
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'node dist/apps/authentication/main.js &' >> /app/start.sh && \
    echo 'node dist/apps/users/main.js &' >> /app/start.sh && \
    echo 'node dist/apps/api-gateway/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 4000

CMD ["/app/start.sh"]
