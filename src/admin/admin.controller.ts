import { Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  @Post('support-agents')
  async createSupportAgent() {}
}
