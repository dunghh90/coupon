import { AutoMap } from "@automapper/classes";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { StoreConst, StoreStatus } from "../enum/status.store.enum";


export type StoreDocument = Store & Document;

@Schema({ timestamps: { currentTime: () => new Date(Date.now()).getTime()  }})
export class Store {
    @Prop()
    @AutoMap()
    name: string;

    @Prop()
    @AutoMap()
    descipton: string;

    @Prop()
    @AutoMap()
    address: string;

    @Prop()
    @AutoMap()
    phone: string;

    @Prop()
    @AutoMap()
    timeActive: string;

    @Prop({
        enum: [StoreStatus.Enable, StoreStatus.Disable],
        default: StoreStatus.Enable
    })
    @AutoMap()
    status: string;
    
    @Prop({
        enum: [StoreConst.DELETED, StoreConst.DONT_DELETE],
        default: StoreConst.DONT_DELETE,
      })
    @AutoMap()
    del_flg: number;
    

    @Prop({type: [{ type: MongooseSchema.Types.ObjectId, ref: 'user' }]})
    @AutoMap()
    managerStores: User[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
    @AutoMap()
    createdBy: User;
    
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
    updatedBy: User;

}

export const StoreSchema = SchemaFactory.createForClass(Store);
