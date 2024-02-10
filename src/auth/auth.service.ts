import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ENV_HASH_ROUNDS,
  ENV_JWT_SECRET,
} from 'src/common/constants/env-key.const';
import * as bcrypt from 'bcrypt';
import { RolesEnum, UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { CommonService } from 'src/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerifyModel } from './entity/emaiil-verify.entity';
import { Repository } from 'typeorm';
import { User } from './type/type';
import { AwsService } from 'src/aws.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
    private readonly awsService: AwsService,
    @InjectRepository(EmailVerifyModel)
    private readonly emailVerifyRepository: Repository<EmailVerifyModel>,
  ) {}

  /**
   * 1. 사용자가 로그인 또는 회원가입을 하면
   *    access_token, refresh_token을 발급 받는다.
   * 2. 로그인 할때는 Basic Token 토큰과 함께 요청을 보낸다.
   *    Basic Token은 email, password를 base64로 인코딩한 값이다.
   *    (autorization: `Basic ${Token}`)
   * 3. 아무나 접근할 수 없는 API는 access_token을 헤더에 담아서 요청을 보낸다.
   *    (autorization: `Bearer ${Token}`)
   * 4. 토큰과 함께 요청을 받은 서버는 요청을 보낸 사람이 누구인지 알수있다.
   */

  extractTokenFromHeader = (header: string, isBearer: boolean) => {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('토큰이 올바르지 않습니다.');
    }
    const token = splitToken[1];
    return token;
  };

  decodeBase64 = (base64String: string) => {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');
    const splitedString = decoded.split(':');
    if (splitedString.length !== 2) {
      throw new UnauthorizedException('올바른 인증 정보가 아닙니다.');
    }
    const [email, password] = splitedString;
    return { email, password };
  };

  verifyToken = (token: string) => {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get(ENV_JWT_SECRET),
      });
    } catch (error) {
      throw new UnauthorizedException('기한이 만료되었거나 잘못된 토큰입니다.');
    }
  };

  rotateToken = (token: string, isRefreshToken: boolean) => {
    const decodedPayload = this.jwtService.verify(token, {
      secret: this.configService.get(ENV_JWT_SECRET),
    });

    if (decodedPayload.type !== 'refresh') {
      return new UnauthorizedException('올바른 토큰이 아닙니다.');
    }
    return this.signToken(
      {
        email: decodedPayload.email,
        id: decodedPayload.sub,
        nickname: decodedPayload.nickname,
        profileImage: decodedPayload.profileImage,
      },
      isRefreshToken,
    );
  };

  /**
   * 만들기능
   *
   * 1. registerWithEmail
   *  - email, password, nickname입력 받아서 회원가입
   *  - 회원가입 성공하면 access_token , refresh_token 발급
   *
   * 2. loginWithEmail
   *  - email, password 입력 받아서 로그인
   *  - 로그인 성공하면 access_token , refresh_token 발급
   *
   * 3. loginUser
   *  - 1,2에서 필요한 access_token, refresh_token 을 반환하는 로직
   *
   * 4. signToken
   *  - 3에서 필요한 access_token, refresh_token 을 sign하는 로직
   *
   * 5. authenticateWithEmailAndPassword
   *  - 2에서 필요한 email, password를 받아서 검증하는 로직
   *  - 사용자가 존재하는지 확인
   *  - 비밀번호가 맞는지 확인
   *  - 사용자가 존재하고 비밀번호가 맞으면 사용자 정보 반환
   */

  /**
   * 회원가입시
   * 1. registerWithEmail(password를 해시하고 유저정보를 만듦)
   * 2. loginUser(유저정보를 받아서 signToken 메서드 호출, 토큰을 만들어서 반환)
   * 3. signToken(jwtService에서 토큰을 만들어서 반환)
   */

  /**
   * 로그인시
   * 1. extractTokenFromHeader(헤더에서 토큰을 추출)
   * 2. decodeBase64(토큰을 디코딩해서 email, password를 추출)
   * 3. loginWithEmail(email, password를 받아서 authenticateWithEmailAndPassword 메서드 호출, 유저정보를 반환)
   * 4. authenticateWithEmailAndPassword(유저정보를 받아서 password 확인후 유저정보를 반환)
   * 5. loginUser(유저정보를 받아서 signToken 메서드 호출, 토큰을 만들어서 반환)
   * 6. signToken(jwtService에서 토큰을 만들어서 반환)
   */

  signToken(
    user: Pick<UsersModel, 'email' | 'id' | 'nickname' | 'profileImage'>,
    isRefreshToken: boolean,
  ) {
    const payload = {
      email: user.email,
      sub: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage,
      type: isRefreshToken ? 'refresh' : 'access',
    };
    const millisecondsInADay = 24 * 60 * 60 * 1000;

    return this.jwtService.sign(payload, {
      secret: this.configService.get(ENV_JWT_SECRET),
      expiresIn: isRefreshToken
        ? 30 * millisecondsInADay
        : 1 * millisecondsInADay,
    });
  }

  loginUser(
    user: Pick<UsersModel, 'email' | 'id' | 'nickname' | 'profileImage'>,
  ) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }
    const passOk = await bcrypt.compare(user.password, existingUser.password);
    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    body: RegisterUserDto,
    file?: Express.Multer.File | string,
  ) {
    const { password, email, nickname, role } = body;
    const hashPassword = await bcrypt.hash(
      password,
      parseInt(this.configService.get(ENV_HASH_ROUNDS)),
    );

    const imageUrl = file
      ? typeof file === 'object'
        ? await this.awsService.uploadFileAndGetUrl('profileImage', file)
        : file
      : null;

    const newUser = await this.usersService.createUser({
      email,
      nickname,
      password: hashPassword,
      role,
      profileImage: imageUrl,
    });

    return this.loginUser(newUser);
  }

  async sendVerificationCode(email: string) {
    const code = Math.floor(Math.random() * 100000).toString();
    const existedUser = await this.usersService.getUserByEmail(email);
    if (existedUser) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }
    const targetEmail = await this.emailVerifyRepository.findOne({
      where: { email },
    });

    try {
      await this.commonService.sendEmailVerificationCode(email, code);
      if (targetEmail) {
        targetEmail.code = code;
        await this.emailVerifyRepository.save(targetEmail);
      } else {
        await this.emailVerifyRepository.save({ email, code });
      }
      return { message: 'success' };
    } catch (err) {
      throw new UnauthorizedException('이메일 인증코드 저장에 실패했습니다.');
    }
  }

  async confirmVerificationCode(email: string, code: string) {
    const savedTarget = await this.emailVerifyRepository.findOne({
      where: { email },
    });

    if (!savedTarget) {
      throw new UnauthorizedException('인증코드가 존재하지 않습니다.');
    }

    if (savedTarget.code !== code) {
      throw new UnauthorizedException('인증코드가 일치하지 않습니다.');
    }

    try {
      await this.emailVerifyRepository.delete({ email });
      return { message: 'success' };
    } catch (err) {
      throw new UnauthorizedException('인증코드 삭제에 실패했습니다.');
    }
  }

  googleLogin(req: Request & User) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return req.user;
  }

  async loginWithGoogle(user: User['user']) {
    try {
      const isExistingUser = await this.usersService.getUserByEmail(user.email);
      if (isExistingUser) {
        // 이미 가입된 유저
        return this.loginUser({
          email: isExistingUser.email,
          id: isExistingUser.id,
          nickname: isExistingUser.nickname,
          profileImage: isExistingUser.profileImage,
        });
      }
      if (!isExistingUser) {
        // 새로운 유저
        return this.registerWithEmail(
          {
            email: user.email,
            nickname: user.name,
            password: user.providerId + user.name,
            role: RolesEnum.USER,
          },
          user.profileImage,
        );
      }
    } catch (err) {
      throw new UnauthorizedException('소셜 로그인에 실패했습니다.');
    }
  }
}
