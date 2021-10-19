import { AutoMap } from "@automapper/classes";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { ScheduleStatus } from "../enum/schedule.mail.enum";


export type TaskSendMailDocument = TaskSendMail & Document;

@Schema({ timestamps: { currentTime: () => new Date(Date.now()).getTime()  }})
export class TaskSendMail {
    @Prop()
    @AutoMap()
    toUser: string;

    @Prop()
    @AutoMap()
    subject: string;

    @Prop()
    @AutoMap()
    content: string;

    @Prop()
    @AutoMap()
    sendDate: string;

    @Prop()
    @AutoMap()
    status: string;
    
    @Prop({
        enum: [ScheduleStatus.Stop, ScheduleStatus.Start],
        default: ScheduleStatus.Stop,
    })
    @AutoMap()
    statusJob: string;

    @AutoMap()
    del_flg: number;
    
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
    @AutoMap()
    createdBy: User;
    
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
    updatedBy: User;

}

export const TaskSendMailSchema = SchemaFactory.createForClass(TaskSendMail);