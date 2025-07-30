import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IncomingMessage } from 'http';
import { IUserRepository, UserRepository } from '../domain/user.repository';
import { UserEntity } from '../domain/user.entity';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger: Logger = new Logger(JwtGuard.name);
  constructor(
    private readonly jwtService: JwtService,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = this.getRequest(context);
    const token = this.getToken(request);

    if (!token) {
      return false;
    }

    try {
      const user = await this.getUserFromToken(token);
      request.user = user;
      return true;
    } catch (e) {
      this.logger.error('JWT validation failed', e);
      throw new UnauthorizedException('Invalid JWT token');
    }
  }

  private getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest<
      IncomingMessage & {
        user?: UserEntity;
      }
    >();
  }

  private getToken(request: {
    headers: Record<string, string | string[]>;
  }): string {
    const authorization = request.headers['authorization'];
    if (!authorization || Array.isArray(authorization)) {
      throw new UnauthorizedException(
        'Authorization header is missing or malformed',
      );
    }
    const [_bearer, token] = authorization.split(' ');
    return token;
  }

  private async getUserFromToken(token: string) {
    const userId = this.jwtService.verify<{ sub: string }>(token);
    const userFromDb = await this.userRepository.findOneById(userId.sub);
    return userFromDb;
  }
}
