import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BannersModel } from './entity/banners.entity';
import { Repository } from 'typeorm';
import { AwsService } from 'src/aws.service';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(BannersModel)
    private readonly bannersRepository: Repository<BannersModel>,
    private readonly awsService: AwsService,
  ) {}
  async getAllBanners() {
    return await this.bannersRepository.find({
      order: {
        createdAt: 'asc',
      },
    });
  }

  async createBanner({
    link,
    file,
  }: {
    link?: string;
    file: Express.Multer.File;
  }) {
    const imageObject = await this.awsService.uploadFileToS3('banner', file);
    const imageUrl = this.awsService.getAwsS3FileUrl(imageObject.key);

    const banner = await this.bannersRepository.save({
      link,
      bannerImage: imageUrl,
    });

    return banner;
  }

  async updateBanner({
    link,
    file,
    bannerId,
  }: {
    link?: string;
    file?: Express.Multer.File;
    bannerId: number;
  }) {
    const banner = await this.bannersRepository.findOne({
      where: { id: bannerId },
    });
    if (!banner) {
      throw new BadRequestException(
        '해당하는 배너가 없습니다. id를 다시 확인해주세요',
      );
    }
    if (file) {
      const imageObject = await this.awsService.uploadFileToS3('banner', file);
      const imageUrl = this.awsService.getAwsS3FileUrl(imageObject.key);
      banner.bannerImage = imageUrl;
    }
    if (link) {
      banner.link = link;
    }
    await this.bannersRepository.save(banner);
    return banner;
  }

  async removeBanner({ bannerId }: { bannerId: number }) {
    const banner = await this.bannersRepository.findOne({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new BadRequestException(
        '해당하는 배너가 없습니다. id를 다시 확인해주세요',
      );
    }

    await this.bannersRepository.remove(banner);
    return { message: 'success' };
  }
}
