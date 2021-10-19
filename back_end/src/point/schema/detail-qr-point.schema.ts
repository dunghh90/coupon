import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from "mongoose";

export type DetailQRPointDocument = DetailQRPoint & Document;

@Schema()
export class DetailQRPoint {
  // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user',})
  // @AutoMap()
  // userId: User;

  // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'store',})
  // @AutoMap()
  // storeId: Store;

  @Prop()
  @AutoMap()
  userId: String;

  @Prop()
  @AutoMap()
  storeId: String;

  @Prop()
  @AutoMap()
  dailyPoint: Number;

  @Prop()
  @AutoMap()
  count: Number;

  // @Prop({
  //   default: new Date().getTime()
  // })
  // @AutoMap()
  // expireDateFrom: Number;
  
  // @Prop({
  //   default: new Date().getTime()
  // })
  // @AutoMap()
  // expireDateTo: Number;

  @Prop({
    default: new Date().getTime()
  })
  @AutoMap()
  created_datetime: Number;

  @Prop()
  @AutoMap()
  created_user: String;

  @Prop({
    default: new Date().getTime()
  })
  @AutoMap()
  updated_datetime: Number;

  @Prop()
  @AutoMap()
  updated_user: String;
}

export const DetailQRPointSchema = SchemaFactory.createForClass(DetailQRPoint);
