import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import console from 'console';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CheckInfoPoint } from './dto/check-info-point.dto';
import { CreateDailyPasscodeDto } from './dto/create-daily-passcode.dto';
import { DailyPointDto } from './dto/daily-point.dto';
import { GenDailyPasscode } from './dto/gen-daily-passcode.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { ViewPointDto } from './dto/view-point.dto';
import { DetailQRPointDocument } from './schema/detail-qr-point.schema';
import { QRPointDocument } from './schema/qr-point.schema';
// For Transaction
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Injectable()
export class PointService {
  constructor(
    @InjectModel('qRPoint')
    private readonly qRPointModel: Model<QRPointDocument>,

    @InjectModel('detailQRPoint')
    private readonly detailQRPointModel: Model<DetailQRPointDocument>,

    private userService: UserService,

    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {}

  //Role Admin
  async getAdminViewPoint() {
    return await this.userService.findAllUser();
  }

  //Role Shop
  async getShopViewPoint(userId: string, viewpointDto: ViewPointDto) {
    const { storeId } = viewpointDto;
    console.log('Role Shop with StoreId ' + storeId);
    return await this.userService.findAllUserInStore(storeId);
  }

  //Role Shop: check info User and Update Point
  async updatePointUser(updatePointDto: UpdatePointDto) {
    const { point, storeId } = updatePointDto;
    const isExistUser = await this.userService.isExistInfoUserstore(
      storeId,
      updatePointDto,
    );

    if (!isExistUser) {
      throw new BadRequestException(`Can not found user in storeId ${storeId}`);
    }
    return this.userService.updatePointUser(point, updatePointDto, {new: true});
  }

  //Role Shop: Gen daily passcode to User get point
  async createDailyPasscode(
    userId: string,
    createDailyPasscode: CreateDailyPasscodeDto,
  ) {
    const {
      qrId,
      storeId,
      dailyPoint,
      limitCount,
      expireDateFrom,
      expireDateTo,
    } = createDailyPasscode;

    const newCreateDailyPasscode = new this.qRPointModel({
      qrId: qrId,
      userId: userId,
      storeId: storeId,
      dailyPoint: dailyPoint,
      limitCount: limitCount,
      date: new Date().getTime(),
      expireDateFrom: new Date(expireDateFrom),
      expireDateTo: new Date(expireDateTo),
    });

    await newCreateDailyPasscode.save();

    return newCreateDailyPasscode.toObject({ versionKey: false });
  }

  //user get daily point
  async setdailyPoint(userId: string, dailyPointDto: DailyPointDto, isGPS: boolean) {
    const { storeId, qrId } = dailyPointDto;
    const currentDate = new Date().getTime()

    //check QRcode exist in QRPoint
    const qrPointObj = await this.checkInfoQRPoint(qrId, storeId);
    if (!qrPointObj) {
      throw new BadRequestException('Can not found information QRCode');
    }

    //Check Expire date of QRCode
    const isExpire = await this.checkExpireDate(
      currentDate, // Date that user Scan
      qrPointObj.expireDateFrom,
      qrPointObj.expireDateTo,
    );
    if (isExpire) {
      throw new BadRequestException('QR code is out range of expired date');
    }

    //Check check-in by GPS
    if (isGPS) {
      const infoUser = await this.infoUserInDetailQRPoint(userId, storeId);

      if (infoUser && currentDate > infoUser.created_datetime) {
        throw new BadRequestException(
          `Sorry! You check in by GPS ad ${infoUser.created_datetime} time.`,
        );
      }
    }

    const countInfoUser = await this.countInfoUserInDetailQRPoint(
      userId,
      storeId,
    );
    console.log('countDocument' + countInfoUser);


    //Check limit count before inserting
    if (countInfoUser >= qrPointObj.limitCount) {
      // ">=" Because countDocument begin at 0++
      throw new BadRequestException(
        `Sorry! QRCode is usered over ${qrPointObj.limitCount} time.`,
      );
    } else {
      //Dailypoint user into  Detail QR Point
      return this.addDetailQRPoint(userId, storeId, qrPointObj);
    }
  }

   async checkInfoQRPoint(qrCode: string, storeObj: any) {
    console.log('checkInfoQRPoint');
    return this.qRPointModel.findOne({
      qrId: qrCode,
      storeId: storeObj,
    });
  }

  async addDetailQRPoint(userId: string, storeId: string, qrPointObj: any) {
    const userObj = await this.userService.findById(userId);
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      //const opts = { session: session };
      const currentDate = new Date().getTime();
      const addToDetailQRPoint = new this.detailQRPointModel({
        userId: userObj._id,
        storeId: storeId,
        dailyPoint: qrPointObj.dailyPoint,
        expireDateFrom: qrPointObj.expireDateFrom,
        expireDateTo: qrPointObj.expireDateTo,
        created_user: 'QR Daily',
        created_datetime: currentDate,
        updated_user: 'QR Daily',
        updated_datetime: currentDate,
      });

      const A = await addToDetailQRPoint.save();

      await this.qRPointModel.findOneAndUpdate(
        { qrId: qrPointObj.qrId },
        { $push: { detailQRPoints: A._id } },
      );

      //Update plus DailyPoint into point of user in UserStoreModel
      console.log('Plus Point +++');
      let pointUser = userObj.point + qrPointObj.dailyPoint;
      const B = await this.userService.updatePointUser(pointUser, userObj);

      await session.commitTransaction();
      session.endSession();
      return B;
    } catch (error) {
      // If an error occurred, abort the whole transaction and
      // undo any changes that might have happened
      await session.abortTransaction();
      session.endSession();
      throw error; // Rethrow so calling function sees error
    }
  }

  // Return true: QR is not available
  async checkExpireDate(dateScan, expireDateFrom, expireDateTo) {
    console.log(
      'check validate QR date: ' +
        'Date: ' +
        dateScan +
        ' expireDateFrom: ' +
        expireDateFrom +
        ' expireDateFrom: ' +
        expireDateTo,
    );
    if (dateScan < expireDateFrom || dateScan > expireDateTo) {
      console.log('This time is NOT OK!');
      return true;
    }
    return false;
  }

  async genDailyPasscode(userId: string, genDailyPasscode: GenDailyPasscode) {
    const { storeId, dateGen } = genDailyPasscode;
    const date = new Date(dateGen).getTime();

    return await this.qRPointModel
      .find({
        ...(userId && { userId }),
        storeId,
        ...(date && { date }),
      })
      .exec();
  }

  // Store manager want to check user point
  async checkInfoPoint(checkInfoPoint: CheckInfoPoint) {
    const { customerId } = checkInfoPoint;
    const userObj = await this.userService.findById(customerId);

    // Check quality of user's point
    if (userObj.point < 0) {
      throw new BadRequestException("Sorry, Customer don't have any point");
    }
    return 'Customer Point is available';
  }

  // User view totalPoint
  async getTotalPoint(userId: string) {
    const userObj = await this.userService.findById(userId);

    if (!userObj.point) {
      return 'Your total point is 0';
    } else {
      return 'Your total point is ' + userObj.point;
    }
  }

  // User view historyPoint
  async getHistoryPoint(userId: string) {
    const historyPoint = await this.detailQRPointModel.find({
      userId: userId,
    });
    return historyPoint;
  }

  async countInfoUserInDetailQRPoint(userId: string, storeId: string) {
    console.log('Get Info QR: userId: ' + userId + ' storeId: ' + storeId);
    return this.detailQRPointModel.countDocuments({
      userId: userId,
      storeId: storeId,
    });
  }

  async infoUserInDetailQRPoint(userId: string, storeId: string) {
    console.log('Get Info QR: userId: ' + userId + ' storeId: ' + storeId);
    return this.detailQRPointModel.findOne({
      userId: userId,
      storeId: storeId,
    });
  }
}
