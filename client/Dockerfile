# Start with a node 10 image with package info
# Installs *all* npm packages and runs build script
FROM node:20-alpine AS builder
RUN mkdir /app/ && chown -R node:node /app
COPY --chown=node:node ["package*.json", "/app/"]
USER node
WORKDIR /app
RUN npm ci && npm cache clean --force
COPY --chown=node:node [ ".", "/app/" ]
ENV NODE_ENV=production
RUN npm run build

# Swaps to nginx and copies the compiled html ready to be serverd
FROM nginx:1.27.2-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
