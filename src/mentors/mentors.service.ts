import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MentorsModel } from './entity/mentors.entity';
import { Repository } from 'typeorm';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { AwsService } from 'src/aws.service';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(MentorsModel)
    private readonly mentorsRepository: Repository<MentorsModel>,
    private readonly awsService: AwsService,
  ) {}
  async getMentors() {
    return await this.mentorsRepository.find();
  }

  async getMentor(id: number) {
    const mentor = await this.mentorsRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
    if (!mentor) {
      throw new BadRequestException(
        '해당하는 id의 mentor가 존재하지 않습니다.',
      );
    }
    return mentor;
  }

  async createMentor(dto: CreateMentorDto, files: Express.Multer.File[]) {
    const alreadyExist = await this.mentorsRepository.exist({
      where: { email: dto.email },
    });
    if (alreadyExist) {
      throw new BadRequestException('이미 존재하는 멘토입니다.');
    }

    const result = await Promise.all(
      files.map((file: Express.Multer.File) =>
        this.awsService.uploadFileToS3('mentors', file),
      ),
    );
    const newUrlArr = result?.map((obj) =>
      this.awsService.getAwsS3FileUrl(obj.key),
    );

    const newMentor = this.mentorsRepository.create({
      ...dto,
      profileImage: newUrlArr,
    });

    await this.mentorsRepository.save(newMentor);
    return newMentor;
  }

  async removeMentor(id: number) {
    const mentor = await this.mentorsRepository.findOne({ where: { id } });
    if (!mentor) {
      throw new BadRequestException(
        '해당하는 id의 mentor가 존재하지 않습니다.',
      );
    }
    await this.mentorsRepository.remove(mentor);
    return { message: 'success' };
  }

  async updateMentor(
    id: number,
    dto: UpdateMentorDto,
    files: Express.Multer.File[],
  ) {
    const mentor = await this.mentorsRepository.findOne({ where: { id } });
    if (!mentor) {
      throw new BadRequestException(
        '해당하는 id의 mentor가 존재하지 않습니다.',
      );
    }

    if (files.length > 0) {
      const newUrlArr = await this.awsService.uploadFilesAndGetUrl(
        'mentors',
        files,
      );

      await this.mentorsRepository.update(
        { id },
        {
          ...dto,
          profileImage: newUrlArr,
        },
      );
      return { message: 'success' };
    }

    await this.mentorsRepository.update(
      { id },
      {
        ...dto,
        profileImage: mentor.profileImage,
      },
    );

    return { message: 'success' };
  }
}
