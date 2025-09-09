# Start with a node image with package info
# Installs *all* npm packages and runs build script
FROM node:22-alpine AS builder
RUN mkdir /app/ && chown -R node:node /app
COPY --chown=node:node ["package*.json", ".npmrc", "/app/"]
USER node
WORKDIR /app
RUN --mount=type=secret,id=fa_token,env=FONTAWESOME_PACKAGE_TOKEN npm ci && npm cache clean --force
COPY --chown=node:node [ ".", "/app/" ]
ENV NODE_ENV=production
RUN npm run build

# Swaps to nginx and copies the compiled html ready to be serverd
FROM nginx:1.29.1-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
