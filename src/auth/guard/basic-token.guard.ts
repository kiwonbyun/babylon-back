import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * 가드에서 구현할 기능
 * 1. 요청객체를 가져오고 authorization header에서 토큰을 추출한다.
 * 2. authService의 extractTokenFromHeader 메서드로 토큰을 추출한다.
 * 3. authService의 decodeBase64 메서드로 토큰을 디코딩해서 email, password를 추출한다.
 * 4. authService의 authenticateWithEmailAndPassword 메서드로 해당 사용자를 가져온다.
 * 5. 찾아낸 사용자를 요청객체에 붙여준다. req.user = user;
 */
@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const { email, password } = this.authService.decodeBase64(token);
    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });
    req.user = user;
    return true;
  }
}
