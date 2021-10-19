import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CouponConst } from '../enum/coupon-const.enum';
import { CouponStatus } from '../enum/coupon-status.enum';

export type CouponDocument = Coupon & Document;

@Schema()
export class Coupon {
  @Prop()
  @AutoMap()
  couponGlobalId: string;

  @Prop({
    enum: [CouponStatus.Enable, CouponStatus.Disable],
    default: CouponStatus.Enable,
  })
  @AutoMap()
  status: string;

  @Prop()
  @AutoMap()
  userId: string;

  @Prop()
  @AutoMap()
  using_datetime: Date;

  @Prop({
    enum: [CouponStatus.Enable, CouponStatus.Disable],
    default: CouponStatus.Disable,
  })
  @AutoMap()
  twoFactorAuth: string;

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

export const CouponSchema = SchemaFactory.createForClass(Coupon);
