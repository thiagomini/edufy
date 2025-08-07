import { Post } from '@nestjs/common';
import { Webhook } from '@src/libs/webhook/webhook.decorator';
import { UserEventDto } from './dto/user-event.dto';

@Webhook('/users/webhook')
export class UserWebhook {
  @Post('')
  handleUserWebhook(event: UserEventDto) {}
}
