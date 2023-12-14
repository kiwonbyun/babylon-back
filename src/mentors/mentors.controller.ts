import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { CheckAdminInterceptor } from 'src/common/interceptor/check-admin.interceptor';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get()
  getMentors() {
    return this.mentorsService.getMentors();
  }

  @Get(':id')
  getMentor(@Param('id', ParseIntPipe) id: number) {
    return this.mentorsService.getMentor(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('profileImage', 10))
  @UseInterceptors(CheckAdminInterceptor)
  createMentor(
    @Body() body: CreateMentorDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.mentorsService.createMentor(body, files);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(CheckAdminInterceptor)
  @UseInterceptors(FilesInterceptor('profileImage', 10))
  updateMentor(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMentorDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.mentorsService.updateMentor(id, body, files);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(CheckAdminInterceptor)
  removeMentor(@Param('id', ParseIntPipe) id: number) {
    return this.mentorsService.removeMentor(id);
  }
}
