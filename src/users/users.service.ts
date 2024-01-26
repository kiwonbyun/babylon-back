import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum, UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';
import { AwsService } from 'src/aws.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly awsService: AwsService,
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async getAllUsers() {
    const users = await this.usersRepository.find({
      order: { id: 'DESC' },
    });
    return users;
  }

  async createUser({
    email,
    nickname,
    password,
    role = RolesEnum.USER,
    profileImage,
  }: {
    email: string;
    nickname: string;
    password: string;
    role: RolesEnum;
    profileImage: string;
  }) {
    const existingNickname = await this.usersRepository.exist({
      where: { nickname },
    });
    if (existingNickname) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }
    const existingEmail = await this.usersRepository.exist({
      where: { email },
    });
    if (existingEmail) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const user = this.usersRepository.create({
      email,
      nickname,
      password,
      role,
      profileImage,
    });
    const newUser = await this.usersRepository.save(user);
    return newUser;
  }

  async getUserByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    return user;
  }

  async getUserById(id: number) {
    return await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'nickname', 'profileImage', 'role'],
    });
  }

  async updateUser(id: number, body: any, file?: Express.Multer.File) {
    const { nickname, profileImage } = body;
    const targetUser = await this.usersRepository.findOne({ where: { id } });
    if (!targetUser) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    const existingNickname = await this.usersRepository.exist({
      where: { nickname },
    });

    if (existingNickname && nickname !== targetUser.nickname) {
      throw new BadRequestException(
        '이미 존재하는 닉네임입니다. 다른 닉네임을 사용해주세요.',
      );
    }

    try {
      const newProfileImageUrl = file
        ? await this.awsService.uploadFileAndGetUrl('profileImage', file)
        : profileImage || null;

      targetUser.nickname = nickname;
      targetUser.profileImage = newProfileImageUrl;

      const updatedUser = await this.usersRepository.save(targetUser);
      return updatedUser;
    } catch (err) {
      throw new BadRequestException('프로필 수정에 실패했습니다.');
    }
  }

  async deleteUserProfileImage(id: number) {
    const targetUser = await this.usersRepository.findOne({ where: { id } });
    if (!targetUser) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    targetUser.profileImage = null;
    const updatedUser = await this.usersRepository.save(targetUser);
    return updatedUser;
  }
}
