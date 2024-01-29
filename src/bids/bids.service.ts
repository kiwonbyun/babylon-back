import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BidStatus, BidsModel } from './entity/bids.entity';
import { DataSource, Repository } from 'typeorm';

import { PostsService } from 'src/posts/posts.service';
import { PrepareBidDto } from './dto/prepare-bid.dto';
import { CompleteBidDto } from './dto/complete-bid.dto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { IMP_KEY, IMP_SECRET } from 'src/common/constants/env-key.const';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(BidsModel)
    private readonly bidsRepository: Repository<BidsModel>,
    private readonly postsService: PostsService,
    private readonly configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async prepareBid(postId: number, userId: number, body: PrepareBidDto) {
    const { name, phone, bidPrice } = body;
    const status = BidStatus.READY;
    const targetPost = await this.postsService.getDetailPost(postId, {
      mentor: false,
    });
    if (targetPost.bidPrice >= bidPrice) {
      throw new BadRequestException('입찰가는 현재 입찰가보다 높아야 합니다.');
    }
    if (targetPost.maxPrice < bidPrice) {
      throw new BadRequestException('입찰가는 최대 입찰가보다 낮아야 합니다.');
    }
    const uniqueMerchantUid = `mid_${uuidv4()}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // portone api에 사전인증 요청
      const preparedMerchantUid = await this.executePaymentPreparation({
        merchant_uid: uniqueMerchantUid,
        amount: bidPrice,
      });

      // 사전인증 성공시 입찰정보 저장
      await this.bidsRepository.save({
        name,
        phone,
        bidPrice,
        merchantUid: preparedMerchantUid,
        status,
        user: { id: userId },
        post: { id: postId },
      });
      await queryRunner.commitTransaction();

      return preparedMerchantUid;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async completeBid(postId: number, body: CompleteBidDto) {
    const { merchant_uid, imp_uid } = body;
    // 사전검증에서 저장했던 입찰내역을 가져온다.
    const preparedBid = await this.bidsRepository.findOne({
      where: { merchantUid: merchant_uid },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // portone api에 사후인증 요청
      const confirmedBid = await this.executePaymentConfirmation({ imp_uid });

      // 사후인증 성공시 입찰정보 저장
      if (confirmedBid.amount !== preparedBid.bidPrice) {
        await this.changeBidStatus(preparedBid, BidStatus.FAIL);
      }
      await this.changeBidStatus(preparedBid, BidStatus.SUCCESS);

      // post의 입찰가를 업데이트
      const targetPost = await this.postsService.getDetailPost(postId);
      targetPost.bidPrice = confirmedBid.amount;
      await this.postsService.updatePost(postId, targetPost);

      await queryRunner.commitTransaction();
      return { message: 'success' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async changeBidStatus(preparedBid, status: BidStatus) {
    await this.bidsRepository.save({
      ...preparedBid,
      status,
    });
    if (status === BidStatus.FAIL) {
      throw new BadRequestException('결제시도가 위조되었습니다.');
    }
  }

  async getBidsByUserId(userId: number) {
    const bids = await this.bidsRepository.find({
      where: { user: { id: userId }, status: BidStatus.SUCCESS },
      order: { createdAt: 'DESC' },
      relations: ['post'],
    });
    return bids;
  }

  async getPortOneAccessToken() {
    const result = await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: this.configService.get(IMP_KEY),
      imp_secret: this.configService.get(IMP_SECRET),
    });
    return result.data.response.access_token;
  }

  async executePaymentPreparation({
    merchant_uid,
    amount,
  }: {
    merchant_uid: string;
    amount: number;
  }) {
    try {
      const impAccessToken = await this.getPortOneAccessToken();
      const { data } = await axios({
        url: 'https://api.iamport.kr/payments/prepare',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${impAccessToken}`,
        },
        data: {
          merchant_uid,
          amount,
        },
      });

      return data.response.merchant_uid;
    } catch (err) {
      throw new BadRequestException('사전인증에 실패했습니다.');
    }
  }

  async executePaymentConfirmation({ imp_uid }: { imp_uid: string }) {
    try {
      const impAccessToken = await this.getPortOneAccessToken();
      const getPaymentData = await axios({
        url: `https://api.iamport.kr/payments/${imp_uid}`,
        method: 'get',
        headers: { Authorization: impAccessToken },
      });
      return getPaymentData.data.response;
    } catch (err) {
      throw new BadRequestException('사후인증에 실패했습니다.');
    }
  }
}
