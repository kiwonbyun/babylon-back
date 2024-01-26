import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsModel } from './entity/bids.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BidsModel]),
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
