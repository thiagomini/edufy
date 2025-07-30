import { Controller, Post, UnauthorizedException } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Post('support-agents')
  async createSupportAgent() {
    throw new UnauthorizedException('Admin key is missing or malformed');
  }
}
