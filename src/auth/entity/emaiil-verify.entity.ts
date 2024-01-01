import { Column, Entity } from 'typeorm';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';

@Entity()
export class EmailVerifyModel extends BaseModel {
  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  code: string;
}
