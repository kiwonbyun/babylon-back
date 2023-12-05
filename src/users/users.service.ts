import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum, UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
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
  }: {
    email: string;
    nickname: string;
    password: string;
    role: RolesEnum;
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
      throw new BadRequestException('이미 존재하는 email입니다.');
    }

    const user = this.usersRepository.create({
      email,
      nickname,
      password,
      role,
    });
    const newUser = await this.usersRepository.save(user);
    return newUser;
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }
}
