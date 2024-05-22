import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/enviroments/enviroment";
import { ReturnResult } from "../../shared/models/return-result";
import { DataFilterWorkCalendar, WorkCalendarDetailModel, WorkCalendarModel } from "./work-calendar-management.model";

@Injectable({
    providedIn: 'root'
})

export class WorkCalendarManagementService {
    baseUrl = environment.apiWorkCalendarManagement;
    constructor(private http: HttpClient) { }

    getWorkCalendar(dataFilter: DataFilterWorkCalendar) {
        return this.http.post<ReturnResult<any>>(`${this.baseUrl}/GetWorkCalendar`, dataFilter);
    }

    saveWorkCalendar(model: WorkCalendarModel): Observable<ReturnResult<WorkCalendarModel>> {
        return this.http.post<ReturnResult<WorkCalendarModel>>(`${this.baseUrl}/SaveWorkCalendar`, model);
    }

    saveWorkCalendarDetail(model: WorkCalendarDetailModel): Observable<ReturnResult<WorkCalendarDetailModel>> {
        return this.http.post<ReturnResult<WorkCalendarDetailModel>>(`${this.baseUrl}/SaveWorkCalendarDetail`, model);
    }

    deleteWorkCalendarDetail(id: number): Observable<ReturnResult<boolean>> {
        return this.http.post<ReturnResult<boolean>>(`${this.baseUrl}/DeleteWorkCalendarDetail`, { workCalendarDetailId: id });
    }

    getWorkCalendarByUserId(fromDate: Date, toDate: Date, userIds: String[]): Observable<ReturnResult<WorkCalendarModel[]>> {
        return this.http.post<ReturnResult<WorkCalendarModel[]>>(`${this.baseUrl}/GetWorkCalendarByUserId`, { fromDate, toDate, userIds });
    }

    // exportAttendanceReport(model: AttendanceReportExportModel): Observable<ReturnResult<AttendanceModel[]>> {
    //     return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/ExportAttendanceReport`, model);
    // }

    // exportDetailAttendanceReport(model: AttendanceReportExportModel): Observable<ReturnResult<AttendanceModel[]>> {
    //     return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/ExportDetailAttendanceReport`, model);
    // }
}