import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('https://github.com/nimarion/photofinish-server')
  index(): string {
    return null;
  }
}
