FROM node:22-alpine AS source
WORKDIR /app
COPY .bootstrap .bootstrap
RUN cat .bootstrap/part-* | base64 -d > /tmp/project.tgz \
    && test "$(wc -c < /tmp/project.tgz)" -eq 54168 \
    && tar -tzf /tmp/project.tgz >/dev/null \
    && tar -xzf /tmp/project.tgz \
    && rm -rf .bootstrap

FROM node:22-alpine AS deps
WORKDIR /app
COPY --from=source /app/package.json /app/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV ADMIN_EMAILS=build@example.com
ENV ADMIN_SESSION_SECRET=build-only-secret-that-is-long-enough
ENV ANALYTICS_SALT=build-only-analytics-salt-that-is-long-enough
COPY --from=deps /app/node_modules ./node_modules
COPY --from=source /app ./
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
