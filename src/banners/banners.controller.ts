import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CheckAdminInterceptor } from 'src/common/interceptor/check-admin.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}
  @Get()
  getAllBanners() {
    return this.bannersService.getAllBanners();
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(CheckAdminInterceptor)
  @UseInterceptors(FileInterceptor('bannerImage'))
  createBanner(
    @UploadedFile() file: Express.Multer.File,
    @Body('link') link?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Banner image is required');
    }
    return this.bannersService.createBanner({ link, file });
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(CheckAdminInterceptor)
  @UseInterceptors(FileInterceptor('bannerImage'))
  updateBanner(
    @Param('id') bannerId: number,
    @Body('link') link?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.bannersService.updateBanner({ link, file, bannerId });
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(CheckAdminInterceptor)
  deleteBanner(@Param('id') bannerId: number) {
    return this.bannersService.removeBanner({ bannerId });
  }
}
