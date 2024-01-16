import { Injectable } from '@nestjs/common';

@Injectable()
export class LiveService {
  findAll() {
    return `This action returns all live`;
  }

  findOne(id: number) {
    return `This action returns a #${id} live`;
  }

  remove(id: number) {
    return `This action removes a #${id} live`;
  }
}
