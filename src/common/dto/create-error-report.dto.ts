import { PickType } from '@nestjs/mapped-types';
import { ErrorReportModel } from '../entities/error-report.entity';

export class CreateErrorReportDto extends PickType(ErrorReportModel, [
  'email',
  'content',
  'name',
]) {}
