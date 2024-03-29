import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum BidStatus {
  READY = 'ready',
  SUCCESS = 'success',
  FAIL = 'fail',
}
@Entity()
export class BidsModel extends BaseModel {
  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Column()
  @IsNumber()
  @IsNotEmpty()
  bidPrice: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  merchantUid: string;

  @Column()
  @IsNotEmpty()
  status: BidStatus;

  @ManyToOne(() => UsersModel, (user) => user.bids)
  user: UsersModel;

  @ManyToOne(() => PostsModel, (post) => post.bids)
  post: PostsModel;
}
