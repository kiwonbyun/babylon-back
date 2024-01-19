import { Exclude } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';

import { Column, Entity } from 'typeorm';

export enum RolesEnum {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    nullable: false,
    unique: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @Column({
    length: 20,
    unique: true,
    nullable: false,
  })
  @IsString()
  @Length(2, 20)
  nickname: string;

  @Column({
    nullable: false,
  })
  @IsString()
  @Length(8, 16)
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    type: 'enum',
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  @IsString()
  role: RolesEnum;

  @Column({ nullable: true })
  @IsString()
  profileImage: string;
}
