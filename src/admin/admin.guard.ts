import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const adminKey = request.headers['x-admin-key'];
    if (!adminKey) {
      throw new UnauthorizedException('Admin key is missing or malformed');
    }
    return true;
  }
}
