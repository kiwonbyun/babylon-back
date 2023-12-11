import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MentorsModel } from './entity/mentors.entity';
import { Repository } from 'typeorm';
import { CreateMentorDto } from './dto/create-mentor.dto';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(MentorsModel)
    private readonly mentorsRepository: Repository<MentorsModel>,
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
    const newMentor = this.mentorsRepository.create({
      ...dto,
      profileImage: [],
    });

    await this.mentorsRepository.save(newMentor);
    return newMentor;
  }
}
