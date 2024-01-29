import { PickType } from '@nestjs/mapped-types';
import { BidsModel } from '../entity/bids.entity';

export class PrepareBidDto extends PickType(BidsModel, [
  'bidPrice',
  'name',
  'phone',
]) {}
