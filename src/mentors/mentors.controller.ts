import {
  BadRequestException,
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
import { User } from 'src/users/decorator/user.decorator';
import { RolesEnum } from 'src/users/entities/users.entity';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateMentorDto } from './dto/update-mentor.dto';

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
  createMentor(
    @User('role') userRole: RolesEnum,
    @Body() body: CreateMentorDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (userRole !== RolesEnum.ADMIN) {
      throw new BadRequestException('일반 유저는 권한이 없습니다.');
    }
    return this.mentorsService.createMentor(body, files);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
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
  removeMentor(@Param('id', ParseIntPipe) id: number) {
    return this.mentorsService.removeMentor(id);
  }
}
