# Start with a node 10 image with package info
# Installs *all* npm packages and runs build script
FROM node:16-alpine as builder
WORKDIR /app
COPY ["package*.json", "/app/"]
ENV NODE_ENV development
RUN npm ci
COPY [ ".", "/app/" ]
ENV NODE_ENV production
RUN npm run build

# Swaps to nginx and copies the compiled html ready to be serverd
FROM nginx:1.19.7-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
