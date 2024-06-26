import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from './entity/posts.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { MentorsModel } from 'src/mentors/entity/mentors.entity';
import { AwsService } from 'src/aws.service';

interface Query {
  [key: string]: string;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(MentorsModel)
    private readonly mentorsRepository: Repository<MentorsModel>,
    private readonly awsService: AwsService,
  ) {}

  async getPosts({ query }: { query: Query }) {
    return await this.postsRepository.find({
      relations: { mentor: true },
      order: query,
    });
  }

  async getDetailPost(
    id: number,
    relations: FindOneOptions['relations'] = { mentor: true },
  ) {
    console.time('postdetail');
    const post = await this.postsRepository.findOne({
      where: { id },
      relations,
    });
    if (!post) {
      throw new BadRequestException('해당하는 id의 post가 존재하지 않습니다.');
    }
    post.views = post.views + 1;
    await this.postsRepository.save(post);
    console.timeEnd('postdetail');
    return post;
  }

  async removePost(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new BadRequestException('해당하는 id의 post가 존재하지 않습니다.');
    }
    await this.postsRepository.remove(post);
    return { message: 'success' };
  }

  async createPost(dto: CreatePostDto, files: Express.Multer.File[]) {
    const mentorExist = await this.mentorsRepository.exist({
      where: { id: dto.mentorId },
    });

    if (!mentorExist) {
      throw new BadRequestException(
        '해당하는 id의 mentor가 존재하지 않습니다.',
      );
    }

    const imageUrls = await this.awsService.uploadFilesAndGetUrl(
      'posts',
      files,
    );

    const newPost = this.postsRepository.create({
      ...dto,
      mentor: { id: dto.mentorId },
      thumbnails: imageUrls,
    });
    await this.postsRepository.save(newPost);

    return { message: 'success' };
  }

  async updatePost(id: number, updatedPost: any) {
    try {
      await this.postsRepository.update({ id }, updatedPost);
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException(
        '변경된 Post 객체 정보 저장에 실패했습니다.',
      );
    }
  }
}
