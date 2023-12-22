import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BannersModel } from './entity/banners.entity';
import { Repository } from 'typeorm';
import { CreateBannerDto } from './dto/create-banner.dto';
import { AwsService } from 'src/aws.service';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(BannersModel)
    private readonly bannersRepository: Repository<BannersModel>,
    private readonly awsService: AwsService,
  ) {}
  async getAllBanners() {
    return await this.bannersRepository.find();
  }

  async createBanner({
    body,
    file,
  }: {
    body: CreateBannerDto;
    file: Express.Multer.File;
  }) {
    const imageObject = await this.awsService.uploadFileToS3('banner', file);
    const imageUrl = this.awsService.getAwsS3FileUrl(imageObject.key);

    const banner = await this.bannersRepository.save({
      ...body,
      imageUrl,
    });
    return banner;
  }
}
