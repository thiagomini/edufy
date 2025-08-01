import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from '@src/app/user/application/user.service';
import { Public } from '@src/app/user/presentation/public.decorator';
import { AdminGuard } from './admin.guard';
import { CreateSupportAgentDto } from './create-support-agent.dto';

@Public()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Post('support-agents')
  async createSupportAgent(@Body() dto: CreateSupportAgentDto) {
    const newUser = await this.userService.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: 'support_agent',
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
  }
}
