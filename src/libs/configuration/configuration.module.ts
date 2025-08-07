import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './jwt.config';
import adminConfig from './admin.config';
import databaseConfig from './database.config';
import webhookConfig from './webhook.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, adminConfig, databaseConfig, webhookConfig],
    }),
  ],
})
export class ConfigurationModule {}
