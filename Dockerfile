# FROM node:18-alpine AS base

# # INSTALL DEPENDENCIES FOR DEVELOPMENT (FOR NEST)
# FROM base AS deps
# WORKDIR /usr/src/app

# COPY --chown=node:node package.json yarn.lock ./
# RUN yarn --frozen-lockfile;

# USER node

# # INSTALL DEPENDENCIES & BUILD FOR PRODUCTION
# FROM base AS build
# WORKDIR /usr/src/app

# COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
# COPY --chown=node:node . .

# RUN yarn build

# ENV NODE_ENV production
# RUN yarn --frozen-lockfile --production;
# RUN rm -rf ./.next/cache

# USER node

# # PRODUCTION IMAGE
# FROM base AS production
# WORKDIR /usr/src/app

# COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
# COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# CMD [ "node", "dist/main.js" ]

# docker image 생성하는 명령어
# docker build . -t babylon-back
# docker image 확인하는 명령어
# docker images
# docker image 실행하는 명령어
# docker container run -d -p 8000:8000 babylon-back
FROM node:18-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY . .
RUN yarn
RUN yarn build
EXPOSE 8000
CMD ["node", "dist/main"]