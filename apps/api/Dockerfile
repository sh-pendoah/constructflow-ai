ARG NODE_VERSION=24.14.0
FROM node:${NODE_VERSION}-bookworm-slim

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

COPY . .

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter docflow-360-core-api build

EXPOSE 8007

CMD ["pnpm", "--filter", "docflow-360-core-api", "start"]
