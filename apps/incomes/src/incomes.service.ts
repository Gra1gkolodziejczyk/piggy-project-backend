import { Injectable } from '@nestjs/common';

@Injectable()
export class IncomesService {
  getHello(): string {
    return 'Hello World!';
  }
}
