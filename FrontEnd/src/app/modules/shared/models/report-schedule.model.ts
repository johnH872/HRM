export interface Month {
    key: string
    value: string
}

export interface Datum {
    userName: string
    owner: any
    type: any
    grandTotal: number
    userId: string
}

export interface Column {
    year: string
    month: Month[]
}

export interface ReportScheduleDatum extends Datum {
    attendanceMonthly: any[]
    attendanceModifiedMonthly: any[]
    leaveRequestMonthly: any[]
    leaveRequestTypeMonthly: any[]
    grandTotalColor: string
    attendanceDetailMonthly: any[]
    attendanceRequestMonthly: any[]
}

export interface ReportScheduleResult {
    data: ReportScheduleDatum[]
    column: Column[]
}

export interface WorkCalendarDatum extends Datum {
    workCalendarMonthly: any[]
}

export interface WorkCalendarResult {
    data: WorkCalendarDatum[]
    column: Column[]
}