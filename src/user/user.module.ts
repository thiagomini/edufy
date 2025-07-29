import { Module } from '@nestjs/common';
import { ConfiguredJwtModule } from '@src/jwt/jwt.module';
import { InMemoryUserRepository } from './data/in-memory.user.repository';
import { JwtGuard } from './presentation/jwt.guard';
import { UserController } from './presentation/user.controller';
import { UserRepository } from './domain/user.repository';

@Module({
  imports: [ConfiguredJwtModule],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
    JwtGuard,
  ],
  exports: [UserRepository],
})
export class UserModule {}
