import { ReportAttendanceModel } from "../../face-recog/punch-in-out-webcam/report-attendance-dialog/report-attendance.model";
import { AttendanceModel } from "../attendance-managment/attendance.model";
import { LeaveRequestModel } from "../leave-request-management/leave-request-management.model";
import { WorkCalendarDetailModel } from "../work-calendar-management/work-calendar-management.model";

export class DashBoardData {
    waitingLeaveRequests: LeaveRequestModel[] = [];
    waitingAttendanceReports: ReportAttendanceModel[] = [];
    myLeaveRequest: LeaveRequestModel[] = [];
    myAttendanceReports: ReportAttendanceModel[] = [];
    myWorkingDetail: WorkCalendarDetailModel[] = [];
    requiredWorkingHours: number = 0;
    workedHours: number = 0;
    leaveHours: number = 0;
}