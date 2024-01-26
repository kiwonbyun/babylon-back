import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entity/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { MentorsModel } from 'src/mentors/entity/mentors.entity';
import { AwsService } from 'src/aws.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, MentorsModel]),
    AuthModule,
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, AwsService],
  exports: [PostsService],
})
export class PostsModule {}
