import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/enviroments/enviroment";
import { ReturnResult } from "../../shared/models/return-result";
import { ReportScheduleModel } from "./report-schedule-management.model";

@Injectable({
    providedIn: 'root'
})

export class ReportScheduleManagementService {
    baseUrl = environment.apiReportScheduleManagement;
    constructor(private http: HttpClient) { }

    getReportSchedule(data: ReportScheduleModel) {
        return this.http.post<ReturnResult<any>>(`${this.baseUrl}/GetReportSchedule`, data);
    }

    // exportAttendanceReport(model: AttendanceReportExportModel): Observable<ReturnResult<AttendanceModel[]>> {
    //     return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/ExportAttendanceReport`, model);
    // }

    // exportDetailAttendanceReport(model: AttendanceReportExportModel): Observable<ReturnResult<AttendanceModel[]>> {
    //     return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/ExportDetailAttendanceReport`, model);
    // }
}