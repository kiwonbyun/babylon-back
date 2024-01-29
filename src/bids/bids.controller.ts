import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { PrepareBidDto } from './dto/prepare-bid.dto';
import { CompleteBidDto } from './dto/complete-bid.dto';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post('/prepare/:id')
  @UseGuards(AccessTokenGuard)
  prepareBid(
    @Param('id', ParseIntPipe) postId: number,
    @User('id') userId: number,
    @Body() body: PrepareBidDto,
  ) {
    return this.bidsService.prepareBid(postId, userId, body);
  }

  @Post('/complete/:id')
  @UseGuards(AccessTokenGuard)
  createBid(
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: CompleteBidDto,
  ) {
    return this.bidsService.completeBid(postId, body);
  }

  @Get('/my')
  @UseGuards(AccessTokenGuard)
  getMyBids(@User('id') userId: number) {
    return this.bidsService.getBidsByUserId(userId);
  }
}
