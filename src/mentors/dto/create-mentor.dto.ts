import { PickType } from '@nestjs/mapped-types';

import { MentorsModel, SnsEnum } from '../entity/mentors.entity';
import { IsEnum, IsInstance, IsOptional, IsString } from 'class-validator';
import { File } from 'buffer';

export class CreateMentorDto extends PickType(MentorsModel, [
  'name',
  'keywords',
  'mainIntro',
  'subject',
  'phone',
  'email',
  'job',
]) {
  @IsOptional()
  @IsString()
  detailIntro?: string;

  @IsInstance(File)
  @IsOptional()
  profileImage?: File[];

  @IsOptional()
  @IsString()
  snsLink?: string;

  @IsOptional()
  @IsEnum(SnsEnum)
  snsPlatform?: SnsEnum;
}
