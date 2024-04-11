import { NumericValueType, email, numeric, prop, required } from "@rxweb/reactive-form-validators";

export class ReportAttendanceModel {
    @prop()
    reportAttendanceId: number | null;
    @prop()
    createdAt: Date | null;
    @email()
    @required()
    email: String | null;
    @prop()
    note: String | null;
}   