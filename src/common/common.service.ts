import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateErrorReportDto } from './dto/create-error-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorReportModel } from './entities/error-report.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(ErrorReportModel)
    private readonly errorReportRepository: Repository<ErrorReportModel>,
    private readonly mailerService: MailerService,
  ) {}
  createErrorReport(dto: CreateErrorReportDto) {
    const errorReport = this.errorReportRepository.create(dto);
    this.errorReportRepository.save(errorReport);
    return errorReport;
  }

  async sendEmailVerificationCode(email: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: 'bkw9603@gmail.com',
        subject: 'BABYLON 인증코드 발송',
        text: `BABYLON 회원가입 인증코드는 [${code}] 입니다.`,
      });
      return true;
    } catch (error) {
      throw new UnauthorizedException('이메일 발송에 실패했습니다.');
    }
  }
}
