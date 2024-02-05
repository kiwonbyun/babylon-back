import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorReportModel } from './entities/error-report.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { MAILER_TRANSPORT } from './constants/env-key.const';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorReportModel]),
    MailerModule.forRootAsync({
      imports: [ConfigModule], // ConfigModule을 imports에 추가
      useFactory: async (configService: ConfigService) => ({
        transport: configService.get(MAILER_TRANSPORT), // ConfigService를 사용하여 환경 변수 참조
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
      }),
      inject: [ConfigService], // ConfigService 주입
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
