import { Injectable } from '@nestjs/common';
import { CreateErrorReportDto } from './dto/create-error-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorReportModel } from './entities/error-report.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(ErrorReportModel)
    private readonly errorReportRepository: Repository<ErrorReportModel>,
  ) {}
  createErrorReport(dto: CreateErrorReportDto) {
    const errorReport = this.errorReportRepository.create(dto);
    this.errorReportRepository.save(errorReport);
    return errorReport;
  }
}
