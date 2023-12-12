import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get()
  getPosts() {
    return this.postsService.getPosts();
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getDetailPost(id);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  removePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.removePost(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('thumbnails', 10))
  createPost(
    @Body() body: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postsService.createPost(body, files);
  }
}
