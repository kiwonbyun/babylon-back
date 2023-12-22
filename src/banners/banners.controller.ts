import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CheckAdminInterceptor } from 'src/common/interceptor/check-admin.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBannerDto } from './dto/create-banner.dto';

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
    @Body() body: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bannersService.createBanner({ body, file });
  }
}
