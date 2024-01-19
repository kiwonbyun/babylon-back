import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  AccessTokenGuard,
  BearerTokenGuard,
} from 'src/auth/guard/bearer-token.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './decorator/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @UseGuards(BearerTokenGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
    @User('id') reqUserId: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (reqUserId !== id) {
      throw new BadRequestException('권한이 없습니다.');
    }
    return this.usersService.updateUser(id, body, file);
  }

  @Delete('profile-image/:id')
  @UseGuards(BearerTokenGuard)
  deleteUserProfileImage(
    @Param('id', ParseIntPipe) id: number,
    @User('id') reqUserId: number,
  ) {
    if (reqUserId !== id) {
      throw new BadRequestException('권한이 없습니다.');
    }
    return this.usersService.deleteUserProfileImage(id);
  }
}
