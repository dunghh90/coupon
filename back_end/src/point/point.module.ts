import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreModule} from 'src/store/store.module';
import { UserModule } from 'src/user/user.module';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { DetailQRPointSchema } from './schema/detail-qr-point.schema';
import { QRPointSchema } from './schema/qr-point.schema';

@Module({
  imports: [
    UserModule,
    StoreModule,
    MongooseModule.forFeature([
      {name: 'qRPoint', schema: QRPointSchema},
      {name: 'detailQRPoint', schema: DetailQRPointSchema},
    ]),
  ],
  controllers: [PointController],
  providers: [PointService]
})
export class PointModule {}
