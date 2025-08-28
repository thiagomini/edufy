import { Module } from '@nestjs/common';
import { CourseModule } from '@src/app/course/course.module';
import { ValidationModule } from '@src/libs/validation/validation.module';
import { ConfigurationModule } from '../libs/configuration/configuration.module';
import { DatabaseModule } from '../libs/database/database.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { DebugModule } from './debug/debug.module';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { SupportModule } from './support/support.module';
import { PaymentModule } from './payment/payment.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import databaseConfig, {
  DatabaseConfig,
} from '@src/libs/configuration/database.config';
import { QueueModule } from '@src/libs/queue/queue.module';

@Module({
  imports: [
    UserModule,
    ConfigurationModule,
    AdminModule,
    DatabaseModule,
    CourseModule,
    ValidationModule,
    ConditionalModule.registerWhen(DebugModule, (env) => env.DEBUG === 'true'),
    SupportModule,
    PaymentModule,
    EventEmitterModule.forRoot({
      global: true,
    }),
    QueueModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (config: DatabaseConfig) => {
        return {
          connectionString: config.url,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
