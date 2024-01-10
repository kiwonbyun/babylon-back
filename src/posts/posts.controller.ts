import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';
import { CheckAdminInterceptor } from 'src/common/interceptor/check-admin.interceptor';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get()
  getPosts(@Query() query: any) {
    return this.postsService.getPosts({ query });
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getDetailPost(id);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(CheckAdminInterceptor)
  removePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.removePost(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('thumbnails', 10))
  @UseInterceptors(CheckAdminInterceptor)
  createPost(
    @Body()
    body: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postsService.createPost(body, files);
  }
}
