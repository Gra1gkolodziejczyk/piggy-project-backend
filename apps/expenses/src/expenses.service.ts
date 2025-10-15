import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpensesService {
  getHello(): string {
    return 'Hello World!';
  }
}
