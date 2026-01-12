# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.16.0

############################
# Dependencies
############################
FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

# Yarn is managed via Corepack in modern Node images.
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

############################
# Build (static assets)
############################
FROM deps AS build

COPY . .
RUN yarn build

############################
# Dev runtime (hot reload)
############################
FROM node:${NODE_VERSION}-alpine AS dev

WORKDIR /app
RUN corepack enable

# Default Vite port is overridden by vite.config.ts (port: 3000).
EXPOSE 3000

# The command is duplicated in docker-compose for clarity and easy tweaking.
CMD ["sh", "-lc", "yarn install --frozen-lockfile && yarn dev --host 0.0.0.0 --port 3000 --strictPort --open false"]

############################
# Production runtime (nginx)
############################
FROM nginx:alpine AS prod

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80