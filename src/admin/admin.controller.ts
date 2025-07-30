import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { CreateSupportAgentDto } from './create-support-agent.dto';
import { randomUUID } from 'crypto';
import { Public } from '@src/user/presentation/public.decorator';

@Public()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  @Post('support-agents')
  async createSupportAgent(@Body() dto: CreateSupportAgentDto) {
    return {
      id: randomUUID(),
      email: dto.email,
      name: dto.name,
    };
  }
}
