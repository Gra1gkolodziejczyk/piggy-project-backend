import { Injectable } from '@nestjs/common';

@Injectable()
export class BanksService {
  getHello(): string {
    return 'Hello World!';
  }
}
