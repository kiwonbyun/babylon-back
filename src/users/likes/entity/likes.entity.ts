import { BaseModel } from 'src/common/entities/base.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class LikesModel extends BaseModel {
  @Column()
  postId: number;

  @ManyToOne(() => UsersModel, (user) => user.likes)
  user: UsersModel;
}
