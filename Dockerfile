
FROM node:18-alpine AS base

ENV NODE_ENV=production
ENV PORT=3000

FROM base as deps

WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install --production=false

FROM base as production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

FROM base as build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD . .
RUN npm run build

FROM base

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .

CMD [  "npm", "run", "start" ]