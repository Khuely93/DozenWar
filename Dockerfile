# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# The optional CA secret is for managed workspaces with an HTTPS proxy.
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm ci --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm run build && npm run test:server && npm prune --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3030
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/locales ./locales
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/online ./online
USER node
EXPOSE 3030
HEALTHCHECK --interval=20s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3030/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/main.cjs"]
