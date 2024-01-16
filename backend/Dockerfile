FROM node:20.11.0-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

FROM node:20.11.0-bullseye-slim

ARG BRANCH="main"
ARG COMMIT=""
LABEL branch=${BRANCH}
LABEL commit=${COMMIT}

ENV COMMIT_SHA=${COMMIT}
ENV COMMIT_BRANCH=${BRANCH}

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD [  "npm", "run", "start:migrate:prod" ]