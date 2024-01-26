import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BidsModel } from './entity/bids.entity';
import { Repository } from 'typeorm';
import { CreateBidDto } from './dto/create-bid.dto';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(BidsModel)
    private readonly bidsRepository: Repository<BidsModel>,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}
  async createBid(postId: number, body: CreateBidDto) {
    const { name, phone, bidPrice, email, merchant_uid } = body;
    const targetUser = await this.usersService.getUserByEmail(email);
    const targetPost = await this.postsService.getDetailPost(postId, {
      mentor: false,
    });

    if (targetPost.bidPrice >= bidPrice) {
      throw new BadRequestException('입찰가는 현재 입찰가보다 높아야 합니다.');
    }

    try {
      targetPost.bidPrice = bidPrice;
      await this.postsService.updatePost(targetPost.id, targetPost);
      await this.bidsRepository.save({
        name,
        phone,
        bidPrice,
        merchantUid: merchant_uid,
        user: { id: targetUser.id },
        post: { id: postId },
      });
    } catch (err) {
      throw new BadRequestException('입찰정보 저장에 실패했습니다.');
    }

    return { message: 'success' };
  }
}
