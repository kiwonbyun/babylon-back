import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ENV_HASH_ROUNDS,
  ENV_JWT_SECRET,
} from 'src/common/constants/env-key.const';
import * as bcrypt from 'bcrypt';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
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
      { email: decodedPayload.email, id: decodedPayload.sub },
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

  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };
    const millisecondsInADay = 24 * 60 * 60 * 1000;

    return this.jwtService.sign(payload, {
      secret: this.configService.get(ENV_JWT_SECRET),
      expiresIn: isRefreshToken
        ? 30 * millisecondsInADay
        : 7 * millisecondsInADay,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
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

  async registerWithEmail({
    email,
    nickname,
    password,
    role,
  }: RegisterUserDto) {
    const hashPassword = await bcrypt.hash(
      password,
      parseInt(this.configService.get(ENV_HASH_ROUNDS)),
    );
    const newUser = await this.usersService.createUser({
      email,
      nickname,
      password: hashPassword,
      role,
    });
    return this.loginUser(newUser);
  }
}