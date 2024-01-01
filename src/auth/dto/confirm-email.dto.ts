import { PickType } from '@nestjs/mapped-types';
import { EmailVerifyModel } from '../entity/emaiil-verify.entity';

export class ConfirmEmailDto extends PickType(EmailVerifyModel, [
  'email',
  'code',
]) {}
