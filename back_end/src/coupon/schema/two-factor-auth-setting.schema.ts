import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CouponConst } from '../enum/coupon-const.enum';
import { CouponStatus } from '../enum/coupon-status.enum';

export type TwoFactorAuthSettingDocument = TwoFactorAuthSetting & Document;

@Schema()
export class TwoFactorAuthSetting {
  @Prop()
  @AutoMap()
  userId: string;

  @Prop({
    enum: [CouponStatus.Enable, CouponStatus.Disable],
    default: CouponStatus.Enable,
  })
  @AutoMap()
  TwoFactorAuthSetting: string;

  @Prop({
    default: Date.now(),
  })
  @AutoMap()
  created_datetime: Date;

  @Prop()
  @AutoMap()
  created_user: string;

  @Prop({
    default: Date.now(),
  })
  @AutoMap()
  updated_datetime: Date;

  @Prop()
  @AutoMap()
  updated_user: string;

  @Prop({
    enum: [CouponConst.DELETED, CouponConst.DONT_DELETE],
    default: CouponConst.DONT_DELETE,
  })
  @AutoMap()
  del_flg: number;
}

export const TwoFactorAuthSettingSchema =
  SchemaFactory.createForClass(TwoFactorAuthSetting);
