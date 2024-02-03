import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesModel } from './entity/likes.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from '../users.module';
import { PostsModel } from 'src/posts/entity/posts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LikesModel, PostsModel]),
    AuthModule,
    UsersModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
