import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum SnsEnum {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
}

@Entity()
export class MentorsModel extends BaseModel {
  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  keywords: string;

  @Column()
  @IsString()
  mainIntro: string;

  @Column({ nullable: true })
  @IsString()
  detailIntro?: string;

  @Column()
  @IsString()
  subject: string;

  @Column()
  @IsPhoneNumber('KR')
  phone: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({
    type: 'enum',
    nullable: true,
    enum: Object.values(SnsEnum),
    default: null,
  })
  @IsString()
  @IsOptional()
  snsPlatform?: SnsEnum;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  snsLink?: string;

  @Column({ type: 'text', array: true })
  @IsString({ each: true })
  @IsOptional()
  profileImage?: string[] = [];

  @OneToMany(() => PostsModel, (post) => post.mentor)
  posts: PostsModel[];
}
