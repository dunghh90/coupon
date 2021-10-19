import { User} from '../../user/schema/user.schema';
import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from "mongoose";
import { Store } from 'src/store/schema/store.schema';
import { DetailQRPoint } from './detail-qr-point.schema';

export type QRPointDocument = QRPoint & Document;

@Schema()
export class QRPoint {
  @Prop()
  @AutoMap()
  qrId: String;

  @Prop()
  @AutoMap()
  userId: String;

  @Prop()
  @AutoMap()
  storeId: String;

  @Prop({type: [{ type: MongooseSchema.Types.ObjectId, ref: 'detailQRPoint' }]})
  @AutoMap()
  detailQRPoints: DetailQRPoint[];

  @Prop()
  @AutoMap()
  dailyPoint: number;

  @Prop()
  @AutoMap()
  limitCount: Number;

  @Prop()
  @AutoMap()
  date: Number;

  @Prop()
  @AutoMap()
  expireDateFrom: Number;
  
  @Prop()
  @AutoMap()
  expireDateTo: Number;

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

export const QRPointSchema = SchemaFactory.createForClass(QRPoint);
