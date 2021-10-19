import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CouponConst } from '../enum/coupon-const.enum';
import { CouponStatus } from '../enum/coupon-status.enum';

export type CouponGlobalDocument = CouponGlobal & Document;

@Schema()
export class CouponGlobal {
  @Prop()
  @AutoMap()
  code: string;

  @Prop()
  @AutoMap()
  name: string;

  @Prop()
  @AutoMap()
  description: string;

  @Prop()
  @AutoMap()
  firstAmount: number;

  @Prop()
  @AutoMap()
  amount: number;

  @Prop({
    default: Date.now(),
  })
  @AutoMap()
  expiration_datetime: Date;

  @Prop({
    enum: [CouponStatus.Enable, CouponStatus.Disable],
    default: CouponStatus.Enable,
  })
  @AutoMap()
  status: string;

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

export const CouponGlobalSchema = SchemaFactory.createForClass(CouponGlobal);
