# [0] A common base for both stages
FROM node:22-alpine AS base
RUN mkdir /app && chown -R node:node /app
COPY --chown=node ["package*.json", "tsconfig.json", "/app/"]
USER node
WORKDIR /app

# [1] A builder to install modules and run a build
FROM base AS builder
ENV NODE_ENV=development
RUN npm ci
COPY --chown=node ["source", "/app/source"]
RUN npm run build

# [2] From the base again, install production deps and copy compilled code
FROM base AS bundle
EXPOSE 3000
ENV NODE_ENV=production
RUN npm ci && npm cache clean --force
# COPY --chown=node ["res", "/app/res"]
COPY --from=builder --chown=node ["/app/bundle/source", "/app/bundle"]
ENTRYPOINT [ "node", "bundle/main.js" ]
CMD ["serve"]
