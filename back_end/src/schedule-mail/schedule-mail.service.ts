import { InjectQueue } from '@nestjs/bull';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Queue } from 'bull';
import { CronJob } from 'cron';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CreateSendMailDto } from './dto/create-schedule-mail.dto';
import { UpdateSendMailDto } from './dto/update-schedule-mail.dto';
import { MailStatus, ScheduleStatus } from './enum/schedule.mail.enum';
import { TaskSendMailDocument } from './schema/schedule-mail.schema';
import { isValidCron } from 'cron-validator'

@Injectable()
export class ScheduleMailService {

  constructor(
    private userService: UserService,
    @InjectModel('task-schedule-mail')
    private readonly scheduleMailModel: Model<TaskSendMailDocument>,
    @InjectQueue('TaskSendMail')
    private mailQueue: Queue,
    private scheduleRegistry: SchedulerRegistry,
  ) {
    this.autoSendMail();
  }

  listMail = [];

  autoSendMail() {
    const MAX_MAIL_NUMBER = 2;
    const DELAY_MAIL_NUMBER = 4000;

    // console.log("🚀 ~ file: schedule-mail.service.ts ~ line 45 ~ ScheduleMailService ~ job ~ listMail", this.listMail)
    setInterval(() => {
      if (this.listMail.length < MAX_MAIL_NUMBER && this.listMail.length > 0) {
        for (let i = 0; i < this.listMail.length; i++) {
          this.mailQueue.add('task-send-mail', this.listMail[i]);
          // console.log("====sendmail ", this.listMail[0]._id)
          this.listMail.splice(0, 1)
        }
        // this.listMail = []
      } else if (this.listMail.length >= MAX_MAIL_NUMBER) {
        for (let i = 0; i < MAX_MAIL_NUMBER; i++) {
          this.mailQueue.add('task-send-mail', this.listMail[0]);
          // console.log("====sendmail ", this.listMail[0]._id)
          this.listMail.splice(0, 1)
        }
      }
      console.log("Now list: ", this.listMail.length)
    }, DELAY_MAIL_NUMBER);
  }

  async sendMail(id: string) {
    const mail = await this.scheduleMailModel.findById(id);
    await this.mailQueue.add('task-send-mail', mail);
  }

  // @Cron('5,20,30,40 * * * * *')
  async scheduleMail(id: string) {
    const mail = await this.scheduleMailModel.findById(id);
    if (mail.statusJob !== ScheduleStatus.Start) {
      // check format date is cron
      if (!isValidCron(mail.sendDate, { seconds: true })) {
        throw new HttpException('Please input sendDate flow format cron!', HttpStatus.BAD_REQUEST);
      }
      
      await this.scheduleMailModel.findByIdAndUpdate(id, {statusJob: ScheduleStatus.Start})
      const job = new CronJob(mail.sendDate, async () => {
        this.listMail.push(mail);
      });
  
      this.scheduleRegistry.addCronJob(`${id}`, job);
      job.start();
    }
    return { status: 'finish' }
  }

  async cancelScheduleMail(id: string) {
    try {
      const mail = await this.scheduleMailModel.findById(id);
      if (mail.statusJob === ScheduleStatus.Start) {

        console.log(`cancel job sendMail`)
        const job = this.scheduleRegistry.getCronJob(`${id}`)
        job.stop();
        await this.scheduleMailModel.findByIdAndUpdate(id, {statusJob: ScheduleStatus.Stop})
      }
      return { status: 'finish' }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(userId: string, createSendMailDto: CreateSendMailDto) {
    try {
      const user = await this.userService.findById(userId);

      const newMail = new this.scheduleMailModel({
        ...createSendMailDto,
        status: 'start',
        createdBy: user._id,
        updatedBy: user._id
      })

      const mailFromDB = await newMail.save();
      return mailFromDB.toJSON();

    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findAll() {
    try {
      return this.scheduleMailModel.find({});
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: string) {
    return this.scheduleMailModel.findById(id);
  }

  async update(id: string, updateSendMailDto: UpdateSendMailDto) {
    try {
      const email = await this.scheduleMailModel.findOne({ _id: id });
      if (!email || email.status === MailStatus.Completed) {
        throw new HttpException("email is Invalid", HttpStatus.BAD_REQUEST);
      }

      return this.scheduleMailModel.findByIdAndUpdate(id, { subject: updateSendMailDto.subject, body: updateSendMailDto.body })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatusTaskSendMail(id: string, status: string) {
    try {
      return this.scheduleMailModel.findByIdAndUpdate(id, { status }, { new: true })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const email = await this.scheduleMailModel.exists({ _id: id });
      if (!email) {
        throw new HttpException("email is Invalid", HttpStatus.BAD_REQUEST);
      }
      return this.scheduleMailModel.findByIdAndDelete(id)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
