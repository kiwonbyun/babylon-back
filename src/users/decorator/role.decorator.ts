import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { RolesEnum, UsersModel } from '../entities/users.entity';

export const Role = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const role = req.user.role as RolesEnum;
    if (!role) {
      throw new InternalServerErrorException(
        'Role데코레이터는 AccessTokenGuard 와 함께 사용해야 합니다. request에 user 프로퍼티가 없습니다.',
      );
    }

    return role;
  },
);
