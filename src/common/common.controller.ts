import { Body, Controller, Post } from '@nestjs/common';
import { CommonService } from './common.service';
import { CreateErrorReportDto } from './dto/create-error-report.dto';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('error')
  createErrorReport(@Body() body: CreateErrorReportDto) {
    return this.commonService.createErrorReport(body);
  }
}
