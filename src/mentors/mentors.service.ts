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
    return await this.mentorsRepository.find({ relations: ['posts'] });
  }

  async getMentor(id: number) {
    const mentor = await this.mentorsRepository.findOne({ where: { id } });
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
    return 'success';
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

    // dto에 profileImage가 없으면 기존의 profileImage를 유지하고,
    // dto에 profileImage가 있으면 기존의 profileImage를 지우고 새로운 profileImage를 추가한다.
    if (files) {
      const result = await Promise.all(
        files.map((file: Express.Multer.File) =>
          this.awsService.uploadFileToS3('mentors', file),
        ),
      );
      const newUrlArr = result?.map((obj) =>
        this.awsService.getAwsS3FileUrl(obj.key),
      );

      await this.mentorsRepository.update(
        { id },
        {
          ...dto,
          profileImage: newUrlArr,
        },
      );
      return 'success';
    }

    await this.mentorsRepository.update(
      { id },
      {
        ...dto,
        profileImage: mentor.profileImage,
      },
    );

    return 'success';
  }
}
