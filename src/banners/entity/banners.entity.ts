import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class BannersModel extends BaseModel {
  @Column()
  @IsNotEmpty()
  @IsString()
  bannerImage: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  link?: string;
}
