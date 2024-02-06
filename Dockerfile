FROM node:18-alpine AS base

# INSTALL DEPENDENCIES FOR DEVELOPMENT (FOR NEST)
FROM base AS deps
WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./
RUN yarn --frozen-lockfile;

USER node

# INSTALL DEPENDENCIES & BUILD FOR PRODUCTION
FROM base AS build
WORKDIR /usr/src/app

COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production
RUN yarn --frozen-lockfile --production;
RUN rm -rf ./.next/cache

USER node

# PRODUCTION IMAGE
FROM base AS production
WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]



# FROM node:18-alpine
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app
# COPY package.json yarn.lock ./
# COPY . .
# RUN yarn
# RUN yarn build
# EXPOSE 8000
# CMD ["node", "dist/main"]

# # 첫 번째 스테이지: 빌드 환경
# FROM node:18-alpine as builder
# WORKDIR /usr/src/app
# COPY package.json yarn.lock ./
# RUN yarn install
# COPY . .
# RUN yarn build

# # 두 번째 스테이지: 실행 환경
# FROM node:18-alpine
# WORKDIR /usr/src/app
# # 빌드 스테이지에서 생성된 빌드 파일만 복사
# COPY --from=builder /usr/src/app/dist ./dist
# COPY package.json yarn.lock ./
# # 런타임에 필요한 production 의존성만 설치
# RUN yarn install --production
# EXPOSE 8000
# CMD ["node", "dist/main"]
