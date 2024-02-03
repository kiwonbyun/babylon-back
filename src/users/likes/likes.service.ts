import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikesModel } from './entity/likes.entity';
import { UsersModel } from '../entities/users.entity';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikesModel)
    private readonly likesRepository: Repository<LikesModel>,
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private dataSource: DataSource,
  ) {}

  async getMyLikes(user: UsersModel) {
    const likes = await this.likesRepository.find({
      where: { user: { id: user.id } },
    });
    const myLikesIds = likes.map((like) => like.postId);
    if (myLikesIds.length > 0) {
      const likedPosts = await this.postsRepository.find({
        where: {
          id: In(myLikesIds),
        },
      });
      return likedPosts;
    }

    return [];
  }

  async getIsLiked(postId: number, user: UsersModel) {
    const usersLike = await this.likesRepository.find({
      where: { user: { id: user.id } },
    });

    return usersLike.some((like) => like.postId === postId);
  }

  async createLike(postId: number, user: UsersModel) {
    const targetPost = await this.postsRepository.findOne({
      where: { id: postId },
    });
    if (!targetPost) {
      throw new BadRequestException('해당하는 id의 post가 존재하지 않습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      targetPost.likeCount = targetPost.likeCount + 1;
      await this.postsRepository.save(targetPost);
      const like = this.likesRepository.create({ postId, user });
      await this.likesRepository.save(like);
      await queryRunner.commitTransaction();
      return targetPost;
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async deleteLike(postId: number, user: UsersModel) {
    const targetPost = await this.postsRepository.findOne({
      where: { id: postId },
    });
    if (!targetPost) {
      throw new BadRequestException('해당하는 id의 post가 존재하지 않습니다.');
    }
    const like = await this.likesRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
    if (like.user.id !== user.id) {
      throw new BadRequestException('삭제 권한이 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      targetPost.likeCount = targetPost.likeCount - 1;
      await this.postsRepository.save(targetPost);
      await this.likesRepository.remove(like);
      await queryRunner.commitTransaction();
      return targetPost;
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
