import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CreateBidDto } from './dto/create-bid.dto';

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
}
