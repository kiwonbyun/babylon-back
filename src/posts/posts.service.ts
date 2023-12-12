import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from './entity/posts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getPosts() {
    return await this.postsRepository.find({ relations: { mentor: true } });
  }

  async getDetailPost(id: number) {
    return await this.postsRepository.findOne({
      where: { id },
      relations: { mentor: true },
    });
  }
}
