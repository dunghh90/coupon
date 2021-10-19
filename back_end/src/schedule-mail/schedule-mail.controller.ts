import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ScheduleMailService } from './schedule-mail.service';
import { CreateSendMailDto } from './dto/create-schedule-mail.dto';
import { UpdateSendMailDto } from './dto/update-schedule-mail.dto';
import JwtAccessAuthGuard from 'src/auth/guards/jwt-access-auth.guard';
import { User, UserDto } from 'src/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('schedule-mail')
@Controller('schedule-mail')
export class ScheduleMailController {
  constructor(
    private readonly scheduleMailService: ScheduleMailService,
  ) {}

  @Post('/create')
  @UseGuards(JwtAccessAuthGuard)
  create(
    @User() user: UserDto,
    @Body() createSendMailDto: CreateSendMailDto) {
    return this.scheduleMailService.create(user.userId, createSendMailDto);
  }

  @Post('/sendmail/:id')
  @UseGuards(JwtAccessAuthGuard)
  async sendMail(
    @Param('id') id: string) {
    this.scheduleMailService.sendMail(id);
    return true;
  }

  @Post('/startScheduleMail/:id')
  @UseGuards(JwtAccessAuthGuard)
  async scheduleSendMail(
    @Param('id') id: string
  ) {
    return this.scheduleMailService.scheduleMail(id);
  }

  @Post('/cancelScheduleMail/:id')
  @UseGuards(JwtAccessAuthGuard)
  async cancelScheduleSendMail(
    @Param('id') id: string
  ) {
    try {
      return this.scheduleMailService.cancelScheduleMail(id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    return await this.scheduleMailService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.scheduleMailService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSendMailDto: UpdateSendMailDto) {
    return this.scheduleMailService.update(id, updateSendMailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleMailService.remove(id);
  }
}
