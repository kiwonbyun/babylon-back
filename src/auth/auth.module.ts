import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerifyModel } from './entity/emaiil-verify.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([EmailVerifyModel]),
    UsersModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
