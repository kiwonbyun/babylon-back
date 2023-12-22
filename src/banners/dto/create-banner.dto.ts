import { PickType } from '@nestjs/mapped-types';
import { BannersModel } from '../entity/banners.entity';

export class CreateBannerDto extends PickType(BannersModel, [
  'bannerImage',
  'link',
]) {}
