import { NumericValueType, email, numeric, prop, required } from "@rxweb/reactive-form-validators";
import { DataStateModel } from "src/app/modules/admin/datastate-management/data-state.model";

export class ReportAttendanceModel {
    @prop()
    attendanceReportId: number | null;
    @prop()
    createdAt: Date | null;
    @email()
    @required()
    email: String;
    @prop()
    note: String;
    @prop()
    type: Object; 
    statusId: number;
    status: DataStateModel;
    imageUrl: String;
}   