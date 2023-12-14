import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RolesEnum, UsersModel } from 'src/users/entities/users.entity';

@Injectable()
export class CheckAdminInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as UsersModel;
    if (!user) {
      throw new InternalServerErrorException(
        'CheckAdminInterceptor는 AccessTokenGuard 와 함께 사용해야 합니다.',
      );
    }
    if (user.role !== RolesEnum.ADMIN) {
      throw new BadRequestException('일반 유저는 권한이 없습니다.');
    }

    return next.handle();
  }
}
