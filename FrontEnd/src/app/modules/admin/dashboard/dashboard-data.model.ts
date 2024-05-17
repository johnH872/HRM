import { ReportAttendanceModel } from "../../face-recog/punch-in-out-webcam/report-attendance-dialog/report-attendance.model";
import { LeaveRequestModel } from "../leave-request-management/leave-request-management.model";

export class DashBoardData {
    waitingLeaveRequests: LeaveRequestModel[] = [];
    waitingAttendanceReports: ReportAttendanceModel[] = [];
}