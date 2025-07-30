import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { CreateSupportAgentDto } from './create-support-agent.dto';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  @Post('support-agents')
  async createSupportAgent(@Body() dto: CreateSupportAgentDto) {}
}
