import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { CouponModule } from './coupon/coupon.module';
import { StoreModule } from './store/store.module';
import { PointModule } from './point/point.module';
import { ScheduleMailModule } from './schedule-mail/schedule-mail.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
      }
    ),
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync( {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DB_URL') || 'mongodb://localhost:27017' ,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }),
      inject: [ConfigService],
    }),
    AutomapperModule.forRoot({
      options: [{ name: 'classMapper', pluginInitializer: classes }],
      singular: true,
    }),
    EventEmitterModule.forRoot(),
    MailModule,
    LoggerModule,
    AuthModule,
    UserModule,
    UploadModule,
    CouponModule,
    StoreModule,
    PointModule,
    ScheduleMailModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
