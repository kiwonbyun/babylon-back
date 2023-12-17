import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS, // 특정 출처 허용
    methods: 'GET,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
  });
  await app.listen(process.env.PORT);
}
bootstrap();
