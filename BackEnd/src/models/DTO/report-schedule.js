export class Month {
    key;
    value;
}

export class Datum {
    userName;
    owner;
    type;
    grandTotal;
    userId;
}

export class Column {
    year;
    month;
}

export class ReportScheduleDatum extends Datum {
    attendanceMonthly = [];
    attendanceModifiedMonthly = [];
    leaveRequestMonthly = [];
    leaveRequestTypeMonthly = [];
    grandTotalColor;
    attendanceDetailMonthly = [];
    attendanceRequestMonthly = [];
}

export class ReportScheduleResult {
    data = new ReportScheduleDatum();
    column = new Column();
}

export class DataFilterReportSchedule {
    timeMode;
    viewMode;
    fromDate;
    toDate;
    order = 0;
    listProfile = [];
    listStatus = [];
    listRoles = [];
    listStatusLeave = [];
}

export class WorkCalendarDatum extends Datum {
    workCalendarMonthly = []
}

export class WorkCalendarResult {
    data = new WorkCalendarDatum();
    column = new Column();
}

export class DataFilterWorkCalendar {
    timeMode;
    viewMode;
    fromDate;
    toDate;
    order = 0;
    listProfile = [];
    listStatus = [];
    listRoles = [];
    listStatusLeave = [];
}