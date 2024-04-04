import { prop } from "@rxweb/reactive-form-validators";

export class ReportScheduleModel {
    @prop()
    timeMode: string;
    @prop()
    viewMode: string;
    @prop()
    fromDate: Date | null;
    @prop()
    toDate: Date | null;
    @prop()
    order: number = 0;
    @prop()
    listProfile: string[] = [];
    @prop()
    listStatus: string[] = [];
    @prop()
    listRoles: string[] = [];
    @prop()
    listStatusLeave: string[] = [];
}