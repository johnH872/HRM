import { prop } from "@rxweb/reactive-form-validators";

export class WorkCalendarModel {
    @prop()
    workCalendarId: number;
    @prop()
    userId: string;
    @prop()
    workingDate: Date | string | null;
    @prop()
    workingType: number | null;
    @prop()
    workingHour: number | null;
}

export class WorkCalendarDetailModel {
    @prop()
    workCalendarDetailId: number;
    @prop()
    workCalendarId: number;
    @prop()
    from: string | null;
    @prop()
    to: string | null;
    @prop()
    description: string | null;
    @prop()
    codeColor: string | null;
}

export class DataFilterWorkCalendar {
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