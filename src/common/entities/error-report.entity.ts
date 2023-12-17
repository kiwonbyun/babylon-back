import { Column, Entity } from 'typeorm';
import { BaseModel } from './base.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class ErrorReportModel extends BaseModel {
  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  content: string;
}
