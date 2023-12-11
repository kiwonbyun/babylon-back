import { Module } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorsModel } from './entity/mentors.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { AwsService } from 'src/aws.service';

@Module({
  imports: [TypeOrmModule.forFeature([MentorsModel]), AuthModule, UsersModule],
  controllers: [MentorsController],
  providers: [MentorsService, AwsService],
})
export class MentorsModule {}
