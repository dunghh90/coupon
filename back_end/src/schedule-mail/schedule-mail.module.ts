import { forwardRef, Module } from '@nestjs/common';
import { ScheduleMailService } from './schedule-mail.service';
import { ScheduleMailController } from './schedule-mail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSendMailSchema } from './schema/schedule-mail.schema';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './schedule-mail.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'task-schedule-mail', schema: TaskSendMailSchema},
    ]),
    MailModule,
    forwardRef(() => UserModule),
    BullModule.registerQueueAsync({
      name: 'TaskSendMail'
    }),
  ],
  controllers: [ScheduleMailController],
  providers: [ScheduleMailService, MailProcessor]
})
export class ScheduleMailModule {}
