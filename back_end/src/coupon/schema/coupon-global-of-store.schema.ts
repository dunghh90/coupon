import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CouponConst } from '../enum/coupon-const.enum';

export type CouponGlobalOfStoreDocument = CouponGlobalOfStore & Document;

@Schema()
export class CouponGlobalOfStore {
  @Prop()
  @AutoMap()
  couponGlobalId: string;

  @Prop()
  @AutoMap()
  storeId: string;

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

export const CouponGlobalOfStoreSchema =
  SchemaFactory.createForClass(CouponGlobalOfStore);
