import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { BannersModel } from './entity/banners.entity';
import { AwsService } from 'src/aws.service';

@Module({
  imports: [TypeOrmModule.forFeature([BannersModel]), AuthModule, UsersModule],
  controllers: [BannersController],
  providers: [BannersService, AwsService],
})
export class BannersModule {}
