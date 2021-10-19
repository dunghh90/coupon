import { MailerService } from '@nestjs-modules/mailer'
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { ScheduleMailService } from './schedule-mail.service'

@Processor('TaskSendMail')
export class MailProcessor {
  constructor(
    private readonly mailerService: MailerService,
    private readonly scheduleMailService: ScheduleMailService,

  ) {}

  @OnQueueActive()
  async onActive(job: Job) {
    const mail: any = job.data
    await this.scheduleMailService.updateStatusTaskSendMail(mail._id,'pendding')
    console.log(`Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`)
  }
  
  @OnQueueCompleted()
  async onComplete(job: Job, result: any) {
    const mail: any = job.data
    await this.scheduleMailService.updateStatusTaskSendMail(mail._id, 'completed')
    console.log(`Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(result)}`)
  }
  
  @OnQueueFailed()
  async onError(job: Job<any>, error: any) {
    const mail: any = job.data
    await this.scheduleMailService.updateStatusTaskSendMail(mail._id, 'fail')
    console.log(`Failed job ${job.id} of type ${job.name}: ${error.message}`, error.stack)
  }

  @Process('task-send-mail')
  async sendWelcomeEmail(job:Job<unknown>){

    const mail: any = job.data

    const contentMail = mail.content;

    try {
      const result = await this.mailerService.sendMail({
        template: './task-email.hbs',
        context: { // ✏️ filling curly brackets with content
            contentMail,
        },
        from: '"Support Team" <support@example.com>', // override default from
        to: mail.toUser,
        subject: `Welcome to ${mail.subject}! Please Confirm Your Email Address`,
      })
      return mail

    } catch (error) {
      // this.logger.error(`Failed to send confirmation email to '${job.data.mailDto.toUser}'`, error.stack)
      throw error
    }
  }
}
