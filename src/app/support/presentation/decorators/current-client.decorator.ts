import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClientEntity } from '../../domain/client.entity';

export const CurrentClient = createParamDecorator(
  (_data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return ClientEntity.fromProps(request.user);
  },
);
