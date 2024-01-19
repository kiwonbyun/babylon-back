import { PickType } from '@nestjs/mapped-types';
import { UsersModel } from '../entities/users.entity';

export class UpdateUserDto extends PickType(UsersModel, ['nickname']) {}
