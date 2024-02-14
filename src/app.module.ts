import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModel } from './users/entities/users.entity';
import {
  ENV_DB_DATABASE,
  ENV_DB_HOST,
  ENV_DB_PASSWORD,
  ENV_DB_PORT,
  ENV_DB_USERNAME,
} from './common/constants/env-key.const';
import { PostsModule } from './posts/posts.module';
import { PostsModel } from './posts/entity/posts.entity';
import { MentorsModule } from './mentors/mentors.module';
import { MentorsModel } from './mentors/entity/mentors.entity';
import { ErrorReportModel } from './common/entities/error-report.entity';
import { CommonModule } from './common/common.module';
import { BannersModule } from './banners/banners.module';
import { BannersModel } from './banners/entity/banners.entity';
import { EmailVerifyModel } from './auth/entity/emaiil-verify.entity';
import { BidsModule } from './bids/bids.module';
import { BidsModel } from './bids/entity/bids.entity';
import { LikesModule } from './users/likes/likes.module';
import { LikesModel } from './users/likes/entity/likes.entity';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV_DB_HOST],
      port: +process.env[ENV_DB_PORT],
      username: process.env[ENV_DB_USERNAME],
      password: process.env[ENV_DB_PASSWORD],
      database: process.env[ENV_DB_DATABASE],
      entities: [
        BidsModel,
        UsersModel,
        PostsModel,
        MentorsModel,
        ErrorReportModel,
        BannersModel,
        EmailVerifyModel,
        LikesModel,
      ],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    MentorsModule,
    CommonModule,
    BannersModule,
    BidsModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
