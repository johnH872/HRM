import { prop, required } from '@rxweb/reactive-form-validators';
export class AttendanceModel {
    @prop()
    attendanceId: number;
    @prop()
    userId: string;
    @prop()
    @required()
    punchinDate: Date;
    @prop()
    punchinTime: number;
    @prop()
    punchinNote: string;
    @prop()
    punchinOffset: number;
    @prop()
    @required()
    punchoutDate: Date;
    @prop()
    punchoutTime: number;
    @prop()
    punchoutNote: string;
    @prop()
    punchoutOffset: number;

    duration: number | null;

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
