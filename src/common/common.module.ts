import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorReportModel } from './entities/error-report.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { MAILER_TANSPORT } from './constants/env-key.const';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorReportModel]),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: process.env[MAILER_TANSPORT],
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
