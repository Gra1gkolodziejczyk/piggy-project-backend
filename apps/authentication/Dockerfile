FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie depuis la racine du contexte de build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps
COPY libs ./libs

RUN pnpm install --frozen-lockfile && \
    pnpm run build authentication && \
    pnpm prune --prod

ENV NODE_ENV=production

EXPOSE 4001

CMD ["node", "dist/apps/authentication/main.js"]
