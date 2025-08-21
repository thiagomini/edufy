FROM node:22.17-alpine AS base
WORKDIR /app
# Installing both `curl` and `procps` here to be available in all later stages
RUN apk update && apk add procps curl && rm -rf /var/lib/apt/lists/*
COPY . .
RUN npm install -g corepack@0.32.0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV HUSKY=0
RUN corepack enable && corepack install
RUN pnpm install --frozen-lockfile

FROM base AS migrate
ENV DATABASE=
CMD ["sh", "-c", "pnpm run kysely migrate:latest", "-e=", "${DATABASE}"]

FROM base AS development
WORKDIR /app
COPY --from=base /app ./
EXPOSE 8000
CMD ["sh", "-c", "pnpm run start:dev"]

FROM base AS build
WORKDIR /app
COPY --from=base /app ./
RUN pnpm run build

FROM base AS production
WORKDIR /mnt/app
ENV HUSKY=0
COPY --chown=1000:1000 --from=build /app/dist/ /mnt/app/dist/
COPY --chown=1000:1000 --from=build /app/package.json /mnt/app/
COPY --chown=1000:1000 --from=build /app/pnpm-lock.yaml /mnt/app/
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3000
CMD ["sh", "-c", "node /mnt/app/dist/src/main.js"]
