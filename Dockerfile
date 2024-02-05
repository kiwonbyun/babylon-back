# # 빌드 스테이지
# FROM node:18 AS build
# WORKDIR /usr/src/app

# # 의존성 파일 복사 및 설치
# COPY package*.json ./
# RUN yarn

# # 소스 코드 복사
# COPY . .

# # NestJS 애플리케이션 빌드
# RUN yarn build

# # 실행 스테이지
# FROM node:18 AS runtime
# WORKDIR /usr/src/app

# # 환경 변수 설정
# ENV NODE_ENV=production

# # 애플리케이션 의존성만 설치
# COPY package*.json ./
# RUN yarn --only=production

# # 빌드 스테이지에서 빌드된 파일 복사
# COPY --from=build /usr/src/app/dist ./dist

# # 애플리케이션 실행
# CMD ["node", "dist/main"]

# docker image 생성하는 명령어
# docker build . -t babylon-back
# docker image 확인하는 명령어
# docker images
# docker image 실행하는 명령어
# docker container run -d -p 8000:8000 babylon-back
FROM node:18
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build
EXPOSE 8000
CMD ["node", "dist/main"]