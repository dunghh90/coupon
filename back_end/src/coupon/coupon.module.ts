import { CouponGlobalOfStoreSchema } from './schema/coupon-global-of-store.schema';
import { forwardRef, Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponGlobalSchema } from './schema/coupon-global.schema';
import { CouponSchema } from './schema/coupon.schema';
import { StoreSchema } from 'src/store/schema/store.schema';
import { TwoFactorAuthSettingSchema } from './schema/two-factor-auth-setting.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'coupon-global', schema: CouponGlobalSchema },
      { name: 'coupon', schema: CouponSchema },
      { name: 'coupon-global-of-store', schema: CouponGlobalOfStoreSchema },
      { name: 'two-factor-auth-setting', schema: TwoFactorAuthSettingSchema },
      { name: 'store', schema: StoreSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
