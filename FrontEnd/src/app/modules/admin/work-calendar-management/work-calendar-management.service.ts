import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/enviroments/enviroment";
import { ReturnResult } from "../../shared/models/return-result";
import { DataFilterWorkCalendar } from "./work-calendar-management.model";

@Injectable({
    providedIn: 'root'
})

export class WorkCalendarManagementService {
    baseUrl = environment.apiWorkCalendarManagement;
    constructor(private http: HttpClient) { }

    getWorkCalendar(dataFilter: DataFilterWorkCalendar) {
        return this.http.post<ReturnResult<any>>(`${this.baseUrl}/GetWorkCalendar`, dataFilter);
    }

    // exportAttendanceReport(model: AttendanceReportExportModel): Observable<ReturnResult<AttendanceModel[]>> {
    //     return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/ExportAttendanceReport`, model);
    // }

    // exportDetailAttendanceReport(model: AttendanceReportExportModel): Observable<ReturnResult<AttendanceModel[]>> {
    //     return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/ExportDetailAttendanceReport`, model);
    // }
}