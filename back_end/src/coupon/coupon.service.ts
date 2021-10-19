import { TwoFactorAuthSettingDocument } from './schema/two-factor-auth-setting.schema';
import { CouponGlobalOfStoreDocument } from './schema/coupon-global-of-store.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCouponGlobalOfStoreDto } from './dto/create-coupon-global-of-store.dto';
import { CreateCouponGlobalDto } from './dto/create-coupon-global.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponGlobalDto } from './dto/update-coupon-global.dto';
import { CouponConst } from './enum/coupon-const.enum';
import { CouponMessage } from './enum/coupon-message.enum';
import { CouponStatus } from './enum/coupon-status.enum';
import {
  CouponGlobal,
  CouponGlobalDocument,
} from './schema/coupon-global.schema';
import { Coupon, CouponDocument } from './schema/coupon.schema';
import { StoreDocument } from 'src/store/schema/store.schema';
import {
  GET_ALL_COUPONS_OF_USER_CAN_USE_QUERY,
  GET_ALL_COUPONS_OF_USER_QUERY,
  GET_ALL_COUPON_OF_STORE_QUERY,
  GET_ALL_OF_THE_USED_COUPONS_OF_USER_QUERY,
  GET_COUPON_BY_ID_OF_USER_QUERY,
} from './query/mongo-query';
import { AcceptUseCouponDto } from './dto/accept-use-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel('coupon-global')
    private couponGlobalModel: Model<CouponGlobalDocument>,
    @InjectModel('coupon') private couponModel: Model<CouponDocument>,
    @InjectModel('coupon-global-of-store')
    private couponGlobalOfStoreModel: Model<CouponGlobalOfStoreDocument>,
    @InjectModel('store') private storeModel: Model<StoreDocument>,
    @InjectModel('two-factor-auth-setting')
    private twoFactorAuthSettingModel: Model<TwoFactorAuthSettingDocument>,
  ) {}

  async createCouponGlobal(
    userId: string,
    createCouponGlobalDto: CreateCouponGlobalDto,
  ): Promise<CouponGlobal> {
    try {
      // Check CouponGlobal's code is exists
      const CheckExistCouponGlobalCode = await this.couponGlobalModel.exists({
        code: createCouponGlobalDto.code,
        del_flg: CouponConst.DONT_DELETE,
      });

      if (CheckExistCouponGlobalCode) {
        throw new HttpException(
          // CouponGlobals Code has existed!
          CouponMessage.MESSAGE_001,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate data
      // Minimum of firstAmount is 1
      createCouponGlobalDto.firstAmount =
        createCouponGlobalDto.firstAmount >= CouponConst.MIN_FIRST_AMOUNT
          ? createCouponGlobalDto.firstAmount
          : CouponConst.MIN_FIRST_AMOUNT;

      // Create data
      const createCouponGlobal = new this.couponGlobalModel({
        ...createCouponGlobalDto,
        created_user: userId,
        updated_user: userId,
        amount: createCouponGlobalDto.firstAmount,
      });

      // Add new a record to table CouponGlobal
      const couponGlobalFromDB = await createCouponGlobal.save();

      // Return json CouponGlobal
      return couponGlobalFromDB.toJSON();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCouponGlobal(
    userId: string,
    _id: string,
    updateCouponGlobalDto: UpdateCouponGlobalDto,
  ) {
    try {
      // Check CouponGlobal is exists
      const checkExistCouponGlobal = await this.couponGlobalModel.exists({
        _id: _id,
        del_flg: CouponConst.DONT_DELETE,
      });

      if (!checkExistCouponGlobal) {
        return new HttpException(
          // CouponGlobals is not exist
          CouponMessage.MESSAGE_002,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check CouponGlobal's code is exists
      const CheckExistCouponGlobalCode = await this.couponGlobalModel.exists({
        _id: { $ne: _id },
        code: updateCouponGlobalDto.code,
        del_flg: CouponConst.DONT_DELETE,
      });

      if (CheckExistCouponGlobalCode) {
        throw new HttpException(
          // CouponGlobals Code has existed!
          CouponMessage.MESSAGE_001,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate data
      updateCouponGlobalDto.firstAmount =
        updateCouponGlobalDto.firstAmount < CouponConst.MIN_FIRST_AMOUNT
          ? CouponConst.MIN_FIRST_AMOUNT
          : updateCouponGlobalDto.firstAmount;

      updateCouponGlobalDto.amount =
        updateCouponGlobalDto.amount < CouponConst.MIN_AMOUNT
          ? CouponConst.MIN_AMOUNT
          : updateCouponGlobalDto.amount;

      updateCouponGlobalDto.status =
        updateCouponGlobalDto.status == CouponStatus.Enable
          ? CouponStatus.Enable
          : CouponStatus.Disable;

      // Edit CouponGlobal on table CouponGlobal
      const couponGlobalFromDB = await this.couponGlobalModel.updateOne(
        { _id },
        {
          $set: {
            ...updateCouponGlobalDto,
            updated_datetime: new Date(),
            updated_user: userId,
          },
        },
      );

      // Return json CouponGlobal
      return couponGlobalFromDB;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCouponGlobal(userId: string, _id: string) {
    try {
      // Check CouponGlobal's code is exists
      const checkExistCouponGlobal = await this.couponGlobalModel.exists({
        _id: _id,
        del_flg: CouponConst.DONT_DELETE,
      });

      if (!checkExistCouponGlobal) {
        return new HttpException(
          // CouponGlobals is not exist
          CouponMessage.MESSAGE_002,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check the relationship with data in another table
      // TODO

      // Delete this record (Change del_flg = 1)
      const couponGlobalFromDB = await this.couponGlobalModel.updateOne(
        { _id },
        {
          $set: {
            updated_datetime: new Date(),
            updated_user: userId,
            del_flg: CouponConst.DELETED,
          },
        },
      );

      return couponGlobalFromDB;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async listOfUnusedCoupons(_storeId: string) {
    try {
      const allCouponsOfStore = await this.getAllCouponOfStore(_storeId);

      return allCouponsOfStore.filter((coupon) => {
        return (
          coupon.amount > CouponConst.MIN_AMOUNT &&
          coupon.del_flg == CouponConst.DONT_DELETE
        );
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllCouponOfStore(_storeId: string) {
    const allCouponOfStore = await this.couponGlobalOfStoreModel.aggregate(
      GET_ALL_COUPON_OF_STORE_QUERY(_storeId),
    );

    return allCouponOfStore.map((coupon) => {
      return coupon.coupon_info;
    });
  }

  async listOfExpiredCoupons(_storeId: string) {
    try {
      const allCouponsOfStore = await this.getAllCouponOfStore(_storeId);

      const current = new Date();
      return allCouponsOfStore.filter((coupon) => {
        return (
          coupon.expiration_datetime < current &&
          coupon.del_flg == CouponConst.DONT_DELETE
        );
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async listAllCouponGlobal(_storeId: string) {
    try {
      const allCouponsOfStore = await this.getAllCouponOfStore(_storeId);

      return allCouponsOfStore.filter((coupon) => {
        return coupon.del_flg == CouponConst.DONT_DELETE;
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getByIdCouponGlobal(id: string) {
    try {
      return await this.couponGlobalModel
        .findOne({
          _id: id,
          del_flg: CouponConst.DONT_DELETE,
        })
        .exec();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createCoupon(
    userId: string,
    createCouponDto: CreateCouponDto,
  ): Promise<Coupon> {
    try {
      // Check the number of Coupon is still or not
      // Has the coupon expired or not?
      const couponGlobal = await this.couponGlobalModel
        .findOne({
          code: createCouponDto.couponGlobalCode,
          amount: { $gt: CouponConst.MIN_AMOUNT },
          expiration_datetime: { $gt: new Date() },
          del_flg: CouponConst.DONT_DELETE,
        })
        .exec();

      if (!couponGlobal) {
        throw new HttpException(
          // The coupon has expired!
          CouponMessage.MESSAGE_004,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Has the user added this coupon yet?
      const coupon = await this.couponModel.exists({
        userId: userId,
        couponGlobalId: couponGlobal._id,
        del_flg: CouponConst.DONT_DELETE,
      });

      if (coupon) {
        throw new HttpException(
          // Users have used this coupon
          CouponMessage.MESSAGE_005,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update amount of CouponGlobal
      await this.couponGlobalModel.updateOne(
        { _id: couponGlobal._id },
        {
          $set: {
            amount: --couponGlobal.amount,
          },
        },
      );

      // Create data
      const createCoupon = new this.couponModel({
        couponGlobalId: couponGlobal._id,
        userId: userId,
        using_datetime: null,
        created_user: userId,
        updated_user: userId,
      });

      // Add new a record to table CouponGlobal
      const newCoupon = await createCoupon.save();

      // Return json CouponGlobal
      return newCoupon.toJSON();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createCouponGlobalOfStore(
    userId: string,
    createCouponGlobalOfStoreDto: CreateCouponGlobalOfStoreDto,
  ) {
    try {
      // Check CouponGlobalId is exists
      const checkExistCouponGlobal = await this.couponGlobalModel.exists({
        _id: createCouponGlobalOfStoreDto.couponGlobalId,
        del_flg: CouponConst.DONT_DELETE,
      });

      if (!checkExistCouponGlobal) {
        throw new HttpException(
          // CouponGlobals is not exist
          CouponMessage.MESSAGE_002,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check StoreId is exists
      const checkExistStore = await this.storeModel.exists({
        _id: createCouponGlobalOfStoreDto.storeId,
        del_flg: CouponConst.DONT_DELETE,
      });

      if (!checkExistStore) {
        throw new HttpException(
          // The store does not exist.
          CouponMessage.MESSAGE_007,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check relationship is exists
      const checkRelationship = await this.couponGlobalOfStoreModel.exists({
        couponGlobalId: createCouponGlobalOfStoreDto.couponGlobalId,
        storeId: createCouponGlobalOfStoreDto.storeId,
      });

      if (checkRelationship) {
        throw new HttpException(
          // This coupon has been distributed to this store.
          CouponMessage.MESSAGE_006,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create CouponGlobalOfStore
      const newCouponGlobalOfStore = new this.couponGlobalOfStoreModel({
        ...createCouponGlobalOfStoreDto,
        created_user: userId,
        updated_user: userId,
      });

      // Add new a record to table CouponGlobalOfStore
      const newCouponGlobalOfStoreFromDB = await newCouponGlobalOfStore.save();

      // Return json CouponGlobalOfStore
      return newCouponGlobalOfStoreFromDB.toJSON();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllCouponsOfUser(customerId: string) {
    try {
      const allCouponsOfUser = await this.couponModel.aggregate(
        GET_ALL_COUPONS_OF_USER_QUERY(customerId),
      );

      return allCouponsOfUser.filter(
        (coupon) => coupon.coupon_info.del_flg == CouponConst.DONT_DELETE,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateStatusCoupon(userId: string, id: string) {
    try {
      // Check the coupon exist and has not been used yet
      const checkCoupon = await this.couponModel
        .findOne({
          _id: id,
          status: CouponStatus.Enable,
          del_flg: CouponConst.DONT_DELETE,
        })
        .exec();

      if (!checkCoupon) {
        throw new HttpException(
          // The coupon does not exist or has been used
          CouponMessage.MESSAGE_009,
          HttpStatus.BAD_REQUEST,
        );
      }

      const getTwoFactorAuthSetting = await this.twoFactorAuthSettingModel
        .findOne({
          userId: checkCoupon.userId,
          TwoFactorAuthSetting: CouponStatus.Enable,
          del_flg: CouponConst.DONT_DELETE,
        })
        .exec();
      // Check two factor authentication
      if (
        getTwoFactorAuthSetting &&
        checkCoupon.twoFactorAuth == CouponStatus.Disable
      ) {
        this.sendAcceptTwoFactorAuthenticationToUser(checkCoupon, userId);
      } else {
        // Update status of the coupon
        const updateCouponFromDB = await this.couponModel.updateOne(
          { _id: id },
          {
            $set: {
              status: CouponStatus.Disable,
              using_datetime: new Date(),
              updated_datetime: new Date(),
              updated_user: userId,
            },
          },
        );

        return updateCouponFromDB;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async acceptUseCoupon(
    userId: string,
    acceptUseCouponDto: AcceptUseCouponDto,
  ) {
    try {
      // Check the coupon exist and has not been used yet
      const checkCoupon = await this.couponModel
        .findOne({
          _id: acceptUseCouponDto.couponId,
          status: CouponStatus.Enable,
          del_flg: CouponConst.DONT_DELETE,
        })
        .exec();

      if (!checkCoupon) {
        throw new HttpException(
          // The coupon does not exist or has been used
          CouponMessage.MESSAGE_009,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update twoFactorAuth of the coupon
      const updateCouponFromDB = await this.couponModel.updateOne(
        { _id: acceptUseCouponDto.couponId },
        {
          $set: {
            twoFactorAuth: CouponStatus.Enable,
            updated_datetime: new Date(),
            updated_user: userId,
          },
        },
      );

      // If the update was successful, send notification Info to store manage
      if (updateCouponFromDB.ok == CouponConst.UPDATE_SUCCESS) {
        const statusUpdate = await this.updateStatusCoupon(
          userId,
          acceptUseCouponDto.couponId,
        );

        if (statusUpdate && statusUpdate.ok == CouponConst.UPDATE_SUCCESS) {
          this.sendAcceptTwoFactorAuthenticationToStore(
            acceptUseCouponDto,
            CouponConst.UPDATE_SUCCESS,
          );
        } else {
          this.sendAcceptTwoFactorAuthenticationToStore(
            acceptUseCouponDto,
            CouponConst.UPDATE_FAILED,
          );
        }
      } else {
        this.sendAcceptTwoFactorAuthenticationToStore(
          acceptUseCouponDto,
          CouponConst.UPDATE_FAILED,
        );
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  sendAcceptTwoFactorAuthenticationToStore(
    acceptUseCouponDto: AcceptUseCouponDto,
    status: number,
  ) {
    // Send notifications to the user that has this id. TODO: user firebase service
    if (status) {
      const notificationInfo = {
        couponId: acceptUseCouponDto.couponId,
        storeManageId: acceptUseCouponDto.storeManageId,
        status: status,
      };

      console.log(
        'sendAcceptTwoFactorAuthenticationToStore: ',
        notificationInfo,
      );
    } else {
      const notificationInfo = {
        status: status,
      };
    }
  }

  sendAcceptTwoFactorAuthenticationToUser(
    coupon: CouponDocument,
    storeManageId: string,
  ) {
    // Send notifications to the user that has this id. TODO: user firebase service
    const notificationInfo = {
      couponId: coupon._id,
      userId: coupon.userId,
      storeManageId: storeManageId,
    };
    console.log('sendAcceptTwoFactorAuthenticationToUser: ', notificationInfo);
  }

  async addNewCouponToUse(
    userId: string,
    createCouponDto: CreateCouponDto,
  ): Promise<Coupon> {
    try {
      // Check the number of coupons is still or not
      // Has the coupon expired or not?
      const couponGlobal = await this.couponGlobalModel
        .findOne({
          code: createCouponDto.couponGlobalCode,
          amount: { $gt: CouponConst.MIN_AMOUNT },
          expiration_datetime: { $gt: new Date() },
          del_flg: CouponConst.DONT_DELETE,
        })
        .exec();

      if (!couponGlobal) {
        throw new HttpException(
          // The coupon has expired!
          CouponMessage.MESSAGE_004,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Has the user added this coupon yet?
      const coupon = await this.couponModel.exists({
        userId: userId,
        couponGlobalId: couponGlobal._id,
        del_flg: CouponConst.DONT_DELETE,
      });

      if (coupon) {
        throw new HttpException(
          // The user has added this coupon.
          CouponMessage.MESSAGE_005,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update amount of CouponGlobal
      await this.couponGlobalModel.updateOne(
        { _id: couponGlobal._id },
        {
          $set: {
            amount: --couponGlobal.amount,
          },
        },
      );

      // Create data
      const createCoupon = new this.couponModel({
        couponGlobalId: couponGlobal._id,
        userId: userId,
        using_datetime: null,
        expiration_datetime: couponGlobal.expiration_datetime,
        created_user: userId,
        updated_user: userId,
      });

      // Add new a record to table CouponGlobal
      const newCouponFromDB = await createCoupon.save();

      // Return json CouponGlobal
      return newCouponFromDB.toJSON();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async listCouponOfUserCanUse(userId: string) {
    try {
      const allCouponOfUserCanUse = await this.couponModel.aggregate(
        GET_ALL_COUPONS_OF_USER_CAN_USE_QUERY(userId),
      );

      return allCouponOfUserCanUse.filter(
        (coupon) => coupon.coupon_info.del_flg == CouponConst.DONT_DELETE,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async listOfUsedCouponsOfUser(userId: string) {
    try {
      const allOfUsedCouponsOfUser = await this.couponModel.aggregate(
        GET_ALL_OF_THE_USED_COUPONS_OF_USER_QUERY(userId),
      );

      return allOfUsedCouponsOfUser.filter(
        (coupon) => coupon.coupon_info.del_flg == CouponConst.DONT_DELETE,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async listOfExpiredCouponsOfUser(userId: string) {
    try {
      // Get all coupons of the user
      const allCouponsOfUser = await this.couponModel.aggregate(
        GET_ALL_COUPONS_OF_USER_QUERY(userId),
      );

      // Check the coupons is expired.
      const today = Date.now();
      const listOfExpiredCouponsOfUser = allCouponsOfUser.filter(
        (coupon) => coupon.coupon_info.expiration_datetime < today,
      );

      return listOfExpiredCouponsOfUser.filter(
        (coupon) => coupon.coupon_info.del_flg == CouponConst.DONT_DELETE,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getByIdCouponOfUser(userId: string, id: string) {
    try {
      const couponByIdOfUse = await this.couponModel.aggregate(
        GET_COUPON_BY_ID_OF_USER_QUERY(id, userId),
      );

      return couponByIdOfUse.filter(
        (coupon) => coupon.coupon_info.del_flg == CouponConst.DONT_DELETE,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateTwoFactorSetting(userId: string) {
    try {
      // Check the user had two-factor authentication enabled.
      const twoFactorAuth = await this.twoFactorAuthSettingModel.findOne({
        userId: userId,
      });

      // If don't exist the two-factor authentication of the user then create it.
      if (!twoFactorAuth) {
        return await this.createTwoFactorSetting(userId);
      } else {
        // Else exist the two-factor authentication then switch status and return it.
        twoFactorAuth.TwoFactorAuthSetting =
          twoFactorAuth.TwoFactorAuthSetting == CouponStatus.Enable
            ? CouponStatus.Disable
            : CouponStatus.Enable;

        // Update the two-factor authentication
        const result = await this.twoFactorAuthSettingModel.updateOne(
          { _id: twoFactorAuth._id },
          {
            $set: {
              TwoFactorAuthSetting: twoFactorAuth.TwoFactorAuthSetting,
              updated_datetime: new Date(),
              updated_user: userId,
            },
          },
        );

        if (result.ok == 1) {
          return {
            ...result,
            TwoFactorAuthSetting: twoFactorAuth.TwoFactorAuthSetting,
          };
        } else {
          return result;
        }
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createTwoFactorSetting(userId: string) {
    try {
      // Create data
      const createTwoFactorSetting = new this.twoFactorAuthSettingModel({
        userId: userId,
        created_user: userId,
        updated_user: userId,
      });

      // Return TwoFactorAuthSetting
      return await createTwoFactorSetting.save();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
