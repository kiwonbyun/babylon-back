import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AwsService } from 'src/aws.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersModel]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, AwsService],
  exports: [UsersService],
})
export class UsersModule {}
