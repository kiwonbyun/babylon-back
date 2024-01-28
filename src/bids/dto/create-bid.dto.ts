import { PickType } from '@nestjs/mapped-types';
import { BidsModel } from '../entity/bids.entity';
import { IsEmail, IsString } from 'class-validator';

export class CreateBidDto extends PickType(BidsModel, [
  'name',
  'phone',
  'bidPrice',
]) {
  @IsEmail()
  email: string;

  @IsString()
  merchant_uid: string;

  @IsString()
  imp_uid: string;
}
