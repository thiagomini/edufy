import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import adminConfig, { AdminConfig } from '@src/libs/configuration/admin.config';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(adminConfig.KEY) private readonly adminConfig: AdminConfig,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const adminKey = request.headers['x-admin-key'];
    if (!adminKey) {
      throw new UnauthorizedException('Admin key is missing or malformed');
    }
    if (adminKey !== this.adminConfig.key) {
      throw new UnauthorizedException('Invalid admin key');
    }
    return true;
  }
}
