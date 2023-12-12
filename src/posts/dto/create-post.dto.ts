import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entity/posts.entity';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ThumbnailDto {
  @IsNotEmpty()
  file: Express.Multer.File;
}
export class CreatePostDto extends PickType(PostsModel, [
  'title',
  'description',
  'minPrice',
  'maxPrice',
  'contents',
  'contentsImages',
  'firmLink',
  'keywords',
  'auctionEndDateTime',
  'lectureDateTime',
  'lectureLocation',
]) {
  @ValidateNested({ each: true, message: 'thumbnails는 필수값입니다' })
  @Type(() => ThumbnailDto)
  thumbnails: Express.Multer.File[];

  @IsNumber()
  mentorId: number;
}
