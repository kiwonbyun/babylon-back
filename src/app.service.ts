import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  heartbeat(): boolean {
    return true;
  }
}
