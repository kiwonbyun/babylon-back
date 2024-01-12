import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { MentorsModel } from 'src/mentors/entity/mentors.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class PostsModel extends BaseModel {
  @Column()
  @IsString()
  title: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Column()
  @IsNumber()
  minPrice: number;

  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @Column({ default: 0 })
  @IsNumber()
  bidPrice: number;

  @Column({ default: 0 })
  @IsNumber()
  likeCount: number;

  @Column({ default: 0 })
  @IsNumber()
  views: number;

  @Column()
  @IsString()
  contents: string;

  @Column({ nullable: true, type: 'text', array: true })
  @IsString({ each: true })
  @IsOptional()
  contentsImages?: string[] = [];

  @Column()
  @IsString()
  @IsOptional()
  firmLink: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  keywords?: string;

  @Column()
  @IsString()
  auctionEndDateTime: string;

  @Column()
  @IsString()
  lectureDateTime: string;

  @Column()
  @IsString()
  lectureLocation: string;

  @Column({ array: true, type: 'text' })
  @IsString({ each: true })
  thumbnails: string[] = [];

  @ManyToOne(() => MentorsModel, (mentor) => mentor.posts)
  mentor: MentorsModel;
}
