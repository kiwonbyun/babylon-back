import { BaseModel } from 'src/common/entities/base.entity';
import { MentorsModel } from 'src/mentors/entity/mentors.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class PostsModel extends BaseModel {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  minPrice: number;

  @Column({ nullable: true })
  maxPrice?: number;

  @Column()
  bidPrice: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column()
  contents: string;

  @Column({ nullable: true, type: 'text', array: true })
  contentsImages?: string[];

  @Column({ nullable: true })
  firmLink?: string;

  @Column({ nullable: true })
  keywords?: string;

  @Column()
  auctionEndDateTime: string;

  @Column()
  lectureDateTime: string;

  @Column()
  lectureLocation: string;

  @Column({ array: true, type: 'text' })
  thumbnail: string[];

  @ManyToOne(() => MentorsModel, (mentor) => mentor.posts)
  mentor: MentorsModel;
}
