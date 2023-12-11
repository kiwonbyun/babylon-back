import { PickType } from '@nestjs/mapped-types';

import { MentorsModel, SnsEnum } from '../entity/mentors.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMentorDto extends PickType(MentorsModel, [
  'name',
  'keywords',
  'mainIntro',
  'subject',
  'phone',
  'email',
]) {
  @IsOptional()
  @IsString()
  detailIntro?: string;

  @IsOptional()
  profileImage?: File[];

  @IsOptional()
  @IsString()
  snsLink?: string;

  @IsOptional()
  @IsEnum(SnsEnum)
  snsPlatform?: SnsEnum;
}
