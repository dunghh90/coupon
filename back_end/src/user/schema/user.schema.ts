import { Store } from 'src/store/schema/store.schema';
import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Role } from 'src/auth/enum/role.enum';
import { UserStatus } from '../enum/status.enum';
//import { DetailStoreDocument } from 'src/point/schema/detail-store.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  @AutoMap()
  userName: string;

  @Prop()
  @AutoMap()
  email: string;

  @Prop()
  @AutoMap()
  firstName: string;

  @Prop()
  @AutoMap()
  lastName: string;

  @Prop()
  @AutoMap()
  password: string;

  @Prop()
  @AutoMap()
  bio: string;

  @Prop()
  @AutoMap()
  avatar_link: string;

  @Prop()
  @AutoMap()
  github: string;

  @Prop()
  @AutoMap()
  linkedin: string;

  @Prop()
  @AutoMap()
  twitter: string;

  @Prop()
  @AutoMap()
  website: string;

  @Prop()
  @AutoMap()
  privateAccount: boolean;

  @Prop()
  @AutoMap()
  hideProfile: boolean;

  @Prop()
  forgotPasswordCode: string;

  @Prop()
  currentHashedRefreshToken: string;

  @Prop()
  tokenActiveEmail: string;

  @Prop()
  @AutoMap()
  isConnectGithub: boolean;

  @Prop({
    enum: [UserStatus.Active, UserStatus.InActive, UserStatus.Delete],
    default: UserStatus.Active,
  })
  @AutoMap()
  status: string;

  @Prop({
    default: true,
  })
  @AutoMap()
  isMember: boolean;

  @Prop({
    default: true,
  })
  @AutoMap()
  isFirstLogin: boolean;
  
  // DongTC update data
  @Prop()
  @AutoMap()
  address: string;

  @Prop()
  @AutoMap()
  phone: string;

  @Prop()
  @AutoMap()
  createdUser: string;

  @Prop({
    default: new Date().getTime()
  })
  createdDatetime: string;

  @Prop()
  @AutoMap()
  updatedUser: string;

  @Prop({
    default: new Date().getTime()
  })
  updatedDatetime: string;

  @Prop()
  @AutoMap()
  point: number;

  // DongTC update data
  @Prop({
    enum: Role,
    default: Role.User,
  })
  
  roles: string;
  // DongTC end update data

  @Prop()
  @AutoMap()
  storeId: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
