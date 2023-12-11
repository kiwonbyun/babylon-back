import { Module } from '@nestjs/common';
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
      entities: [UsersModel, PostsModel, MentorsModel],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    MentorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
