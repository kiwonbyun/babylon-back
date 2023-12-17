import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorReportModel } from './entities/error-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorReportModel])],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
