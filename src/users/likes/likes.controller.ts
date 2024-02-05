import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from '../decorator/user.decorator';
import { UsersModel } from '../entities/users.entity';

@Controller('users/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get('my')
  @UseGuards(AccessTokenGuard)
  getMyLikes(@User() user: UsersModel) {
    return this.likesService.getMyLikes(user);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  async getIsLiked(
    @Param('id', ParseIntPipe) postId: number,
    @User() user: UsersModel,
  ) {
    return this.likesService.getIsLiked(postId, user);
  }

  @Post(':id')
  @UseGuards(AccessTokenGuard)
  async postLike(
    @Param('id', ParseIntPipe) postId: number,
    @User() user: UsersModel,
  ) {
    return this.likesService.createLike(postId, user);
  }
}
