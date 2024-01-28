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
import { CreateBidDto } from './dto/create-bid.dto';
import { User } from 'src/users/decorator/user.decorator';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post(':id')
  @UseGuards(AccessTokenGuard)
  createBid(
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: CreateBidDto,
  ) {
    return this.bidsService.createBid(postId, body);
  }

  @Get('/my')
  @UseGuards(AccessTokenGuard)
  getMyBids(@User('id') userId: number) {
    return this.bidsService.getBidsByUserId(userId);
  }
}
