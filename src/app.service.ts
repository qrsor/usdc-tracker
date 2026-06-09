import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /** Health-check endpoint: always returns "Hello World!". */
  getHello(): string {
    return 'Hello World!';
  }
}
