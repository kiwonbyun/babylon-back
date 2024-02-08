import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  heartbeat() {
    return true;
  }
}
