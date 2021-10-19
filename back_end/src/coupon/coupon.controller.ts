import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponGlobalDto } from './dto/create-coupon-global.dto';
import JwtAccessAuthGuard from 'src/auth/guards/jwt-access-auth.guard';
import { UpdateCouponGlobalDto } from './dto/update-coupon-global.dto';
import { User, UserDto } from 'src/decorators/user.decorator';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CreateCouponGlobalOfStoreDto } from './dto/create-coupon-global-of-store.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AcceptUseCouponDto } from './dto/accept-use-coupon.dto';

@ApiTags('coupon')
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('global')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  createCouponGlobal(
    @User() user: UserDto,
    @Body() createCouponGlobalDto: CreateCouponGlobalDto,
  ) {
    return this.couponService.createCouponGlobal(
      user.userId,
      createCouponGlobalDto,
    );
  }

  @Patch('global/:id')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  updateCouponGlobal(
    @User() user: UserDto,
    @Param('id') id: string,
    @Body() updateCouponGlobalDto: UpdateCouponGlobalDto,
  ) {
    return this.couponService.updateCouponGlobal(
      user.userId,
      id,
      updateCouponGlobalDto,
    );
  }

  @Delete('global/:id')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  deleteCouponGlobal(@User() user: UserDto, @Param('id') id: string) {
    return this.couponService.deleteCouponGlobal(user.userId, id);
  }

  @Get('global/list_of_unused_coupons/:idStore')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  listOfUnusedCoupons(@Param('idStore') idStore: string) {
    return this.couponService.listOfUnusedCoupons(idStore);
  }

  @Get('global/list_of_expired_coupons/:idStore')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  listOfExpiredCoupons(@Param('idStore') idStore: string) {
    return this.couponService.listOfExpiredCoupons(idStore);
  }

  @Get('global/list_all/:idStore')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  listAllCouponGlobal(@Param('idStore') idStore: string) {
    return this.couponService.listAllCouponGlobal(idStore);
  }

  @Get('global/export_coupon/:id')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  getByIdCouponGlobal(@Param('id') id: string) {
    return this.couponService.getByIdCouponGlobal(id);
  }

  @Post()
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  sendCoupon(@User() user: UserDto, @Body() createCouponDto: CreateCouponDto) {
    return this.couponService.createCoupon(user.userId, createCouponDto);
  }

  @Post('distribute_coupon_to_store')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  distributeCouponToStore(
    @User() user: UserDto,
    @Body() createCouponGlobalOfStoreDto: CreateCouponGlobalOfStoreDto,
  ) {
    return this.couponService.createCouponGlobalOfStore(
      user.userId,
      createCouponGlobalOfStoreDto,
    );
  }

  @Get('coupon_of_user/:userId')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  getAllCouponsOfUser(@User() user: UserDto, @Param('userId') userId: string) {
    return this.couponService.getAllCouponsOfUser(userId);
  }

  @Patch('shop_scan_coupon_of_user/:id')
  @Roles(Role.Admin, Role.Shop)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  scanCouponOfUse(@User() user: UserDto, @Param('id') id: string) {
    return this.couponService.updateStatusCoupon(user.userId, id);
  }

  @Patch('scan_coupon')
  @UseGuards(JwtAccessAuthGuard)
  userScanCoupon(
    @User() user: UserDto,
    @Body() createCouponDto: CreateCouponDto,
  ) {
    return this.couponService.addNewCouponToUse(user.userId, createCouponDto);
  }

  @Get('list_coupon_of_user_can_use')
  @UseGuards(JwtAccessAuthGuard)
  listCouponOfUserCanUse(@User() user: UserDto) {
    return this.couponService.listCouponOfUserCanUse(user.userId);
  }

  @Get('/list_of_used_coupons_of_user')
  @UseGuards(JwtAccessAuthGuard)
  listOfUsedCouponsOfUser(@User() user: UserDto) {
    return this.couponService.listOfUsedCouponsOfUser(user.userId);
  }

  @Get('list_of_expired_coupons_of_user')
  @UseGuards(JwtAccessAuthGuard)
  listOfExpiredCouponsOfUser(@User() user: UserDto) {
    return this.couponService.listOfExpiredCouponsOfUser(user.userId);
  }

  @Get('view_coupon_of_user/:id')
  @UseGuards(JwtAccessAuthGuard)
  getByIdCouponOfUser(@User() user: UserDto, @Param('id') id: string) {
    return this.couponService.getByIdCouponOfUser(user.userId, id);
  }

  @Patch('update_two_factor_setting')
  @UseGuards(JwtAccessAuthGuard)
  updateTwoFactorSetting(@User() user: UserDto) {
    return this.couponService.updateTwoFactorSetting(user.userId);
  }

  @Patch('accept_use_coupon/:id')
  @UseGuards(JwtAccessAuthGuard)
  acceptUseCoupon(
    @User() user: UserDto,
    @Body() acceptUseCouponDto: AcceptUseCouponDto,
  ) {
    return this.couponService.acceptUseCoupon(user.userId, acceptUseCouponDto);
  }
}
