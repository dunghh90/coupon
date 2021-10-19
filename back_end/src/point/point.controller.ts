import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enum/role.enum';
import JwtAccessAuthGuard from 'src/auth/guards/jwt-access-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserDto } from 'src/decorators/user.decorator';
import { CheckInfoPoint } from './dto/check-info-point.dto';
import { CreateDailyPasscodeDto } from './dto/create-daily-passcode.dto';
import { DailyPointDto } from './dto/daily-point.dto';
import { GenDailyPasscode } from './dto/gen-daily-passcode.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { ViewPointDto } from './dto/view-point.dto';
import { PointService } from './point.service';
import { QRPoint } from './schema/qr-point.schema';

@ApiTags('point')
@Controller('point')
export class PointController {
  constructor(private pointService: PointService) {}

  //Admin View Point
  @Get('adminviewpoint')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async getAdminViewPoint() {
    console.log('view point');
    return this.pointService.getAdminViewPoint();
  }

  //Shop View Point
  @Get('shopviewpoint')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async getShopViewPoint(
    @User() user: UserDto,
    @Query() viewpointDto: ViewPointDto,
  ) {
    console.log('view point');
    return this.pointService.getShopViewPoint(user.userId, viewpointDto);
  }

  //Role shop: Update point user
  @Patch('editpoint')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async updatePointUser(@Body() updatePointDto: UpdatePointDto) {
    console.log('Add point to User');

    return this.pointService.updatePointUser(updatePointDto);
  }

  //Store manager setting daily passcode
  @Post('createpasscode')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async createDailyPasscode(
    @User() user: UserDto,
    @Body() createDailyPasscode: CreateDailyPasscodeDto,
  ): Promise<QRPoint> {
    console.log('Shop create daily passcode');
    return this.pointService.createDailyPasscode(
      user.userId,
      createDailyPasscode,
    );
  }

  //User get daily point
  @Post('setdailypoint')
  @UseGuards(JwtAccessAuthGuard)
  async setdailyPoint(
    @User() user: UserDto,
    @Body() dailyPoint: DailyPointDto,
  ) {
    console.log('User get daily point');

    return this.pointService.setdailyPoint(user.userId, dailyPoint, false);
  }

  //GPS set daily point
  @Post('gpsSetdailypoint')
  @UseGuards(JwtAccessAuthGuard)
  async gpsSetdailypoint(
    @User() user: UserDto,
    @Body() dailyPoint: DailyPointDto,
  ) {
    console.log('GPS set daily point');

    return this.pointService.setdailyPoint(user.userId, dailyPoint, true);
  }

  @Get('gendailypasscode')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async genDailyPasscode(
    @User() user: UserDto,
    @Query() genDailyPasscode: GenDailyPasscode,
  ) {
    console.log('Gen daily point');
    return this.pointService.genDailyPasscode(user.userId, genDailyPasscode);
  }

  @Get('checkpoint')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async checkInfoPoint(@Query() checkInfoPoint: CheckInfoPoint) {
    return this.pointService.checkInfoPoint(checkInfoPoint);
  }

  @Get('totalpoint')
  @UseGuards(JwtAccessAuthGuard)
  async getTotalPoint(@User() user: UserDto) {
    return this.pointService.getTotalPoint(user.userId);
  }

  @Get('historypoints')
  @UseGuards(JwtAccessAuthGuard)
  async getHistoryPoint(@User() user: UserDto) {
    return this.pointService.getHistoryPoint(user.userId);
  }
}
