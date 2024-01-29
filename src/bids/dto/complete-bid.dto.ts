import { IsString } from 'class-validator';

export class CompleteBidDto {
  @IsString()
  merchant_uid: string;

  @IsString()
  imp_uid: string;
}
