import { CouponConst } from '../enum/coupon-const.enum';
import { CouponStatus } from '../enum/coupon-status.enum';

export const GET_COUPON_BY_ID_QUERY = (id: string) => {
  return [
    {
      $project: {
        _id: { $toString: '$_id' },
        couponGlobalId: { $toObjectId: '$couponGlobalId' },
        userId: { $toObjectId: '$userId' },
        del_flg: '$del_flg',
        updated_datetime: '$updated_datetime',
        created_datetime: '$created_datetime',
        twoFactorAuth: '$twoFactorAuth',
        status: '$status',
        using_datetime: '$using_datetime',
        created_user: '$created_user',
        updated_user: '$created_user',
      },
    },
    {
      $match: {
        _id: id,
        del_flg: CouponConst.DONT_DELETE,
      },
    },
    {
      $lookup: {
        from: 'coupon-globals',
        localField: 'couponGlobalId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              code: '$code',
              name: '$name',
              description: '$description',
              expiration_datetime: '$expiration_datetime',
            },
          },
        ],

        as: 'coupon_info',
      },
    },
    {
      $addFields: {
        coupon_info: { $arrayElemAt: ['$coupon_info', 0] },
      },
    },
    { $limit: 1 },
  ];
};

export const GET_ALL_COUPONS_OF_USER_QUERY = (userId: string) => {
  return [
    {
      $project: {
        couponGlobalId: { $toObjectId: '$couponGlobalId' },
        userId: '$userId',
        del_flg: '$del_flg',
        updated_datetime: '$updated_datetime',
        created_datetime: '$created_datetime',
        twoFactorAuth: '$twoFactorAuth',
        status: '$status',
        using_datetime: '$using_datetime',
        created_user: '$created_user',
        updated_user: '$created_user',
      },
    },
    {
      $match: {
        userId: userId,
        del_flg: CouponConst.DONT_DELETE,
      },
    },
    {
      $lookup: {
        from: 'coupon-globals',
        localField: 'couponGlobalId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              code: '$code',
              name: '$name',
              description: '$description',
              expiration_datetime: '$expiration_datetime',
              del_flg: '$del_flg',
            },
          },
        ],
        as: 'coupon_info',
      },
    },
    {
      $addFields: {
        coupon_info: { $arrayElemAt: ['$coupon_info', 0] },
      },
    },
  ];
};

export const GET_ALL_COUPONS_OF_USER_CAN_USE_QUERY = (userId: string) => {
  return [
    {
      $project: {
        couponGlobalId: { $toObjectId: '$couponGlobalId' },
        userId: '$userId',
        del_flg: '$del_flg',
        updated_datetime: '$updated_datetime',
        created_datetime: '$created_datetime',
        twoFactorAuth: '$twoFactorAuth',
        status: '$status',
        using_datetime: '$using_datetime',
        created_user: '$created_user',
        updated_user: '$created_user',
      },
    },
    {
      $match: {
        userId: userId,
        status: CouponStatus.Enable,
        del_flg: CouponConst.DONT_DELETE,
      },
    },
    {
      $lookup: {
        from: 'coupon-globals',
        localField: 'couponGlobalId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              code: '$code',
              name: '$name',
              description: '$description',
              expiration_datetime: '$expiration_datetime',
              del_flg: '$del_flg',
            },
          },
        ],
        as: 'coupon_info',
      },
    },
    {
      $addFields: {
        coupon_info: { $arrayElemAt: ['$coupon_info', 0] },
      },
    },
  ];
};

export const GET_ALL_OF_THE_USED_COUPONS_OF_USER_QUERY = (userId: string) => {
  return [
    {
      $project: {
        couponGlobalId: { $toObjectId: '$couponGlobalId' },
        userId: '$userId',
        del_flg: '$del_flg',
        updated_datetime: '$updated_datetime',
        created_datetime: '$created_datetime',
        twoFactorAuth: '$twoFactorAuth',
        status: '$status',
        using_datetime: '$using_datetime',
        created_user: '$created_user',
        updated_user: '$created_user',
      },
    },
    {
      $match: {
        userId: userId,
        status: CouponStatus.Disable,
        del_flg: CouponConst.DONT_DELETE,
      },
    },
    {
      $lookup: {
        from: 'coupon-globals',
        localField: 'couponGlobalId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              code: '$code',
              name: '$name',
              description: '$description',
              expiration_datetime: '$expiration_datetime',
              del_flg: '$del_flg',
            },
          },
        ],
        as: 'coupon_info',
      },
    },
    {
      $addFields: {
        coupon_info: { $arrayElemAt: ['$coupon_info', 0] },
      },
    },
  ];
};

export const GET_COUPON_BY_ID_OF_USER_QUERY = (id: string, userId: string) => {
  return [
    {
      $project: {
        _id: { $toString: '$_id' },
        couponGlobalId: { $toObjectId: '$couponGlobalId' },
        userId: '$userId',
        del_flg: '$del_flg',
        updated_datetime: '$updated_datetime',
        created_datetime: '$created_datetime',
        twoFactorAuth: '$twoFactorAuth',
        status: '$status',
        using_datetime: '$using_datetime',
        created_user: '$created_user',
        updated_user: '$created_user',
      },
    },
    {
      $match: {
        _id: id,
        userId: userId,
        del_flg: CouponConst.DONT_DELETE,
      },
    },
    {
      $lookup: {
        from: 'coupon-globals',
        localField: 'couponGlobalId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              code: '$code',
              name: '$name',
              description: '$description',
              expiration_datetime: '$expiration_datetime',
              del_flg: '$del_flg',
            },
          },
        ],

        as: 'coupon_info',
      },
    },
    {
      $addFields: {
        coupon_info: { $arrayElemAt: ['$coupon_info', 0] },
      },
    },
    { $limit: 1 },
  ];
};

export const GET_ALL_COUPON_OF_STORE_QUERY = (_storeId: string) => {
  return [
    {
      $project: {
        couponGlobalId: { $toObjectId: '$couponGlobalId' },
        storeId: '$storeId',
        del_flg: '$del_flg',
      },
    },
    {
      $match: {
        storeId: _storeId,
        del_flg: CouponConst.DONT_DELETE,
      },
    },
    {
      $lookup: {
        from: 'coupon-globals',
        localField: 'couponGlobalId',
        foreignField: '_id',
        as: 'coupon_info',
      },
    },
    {
      $addFields: {
        coupon_info: { $arrayElemAt: ['$coupon_info', 0] },
      },
    },
  ];
};
