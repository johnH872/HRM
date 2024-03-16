import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LeaveBonusModel, LeaveRequestModel } from "./leave-request-management.model";
import { HttpClient } from "@angular/common/http";
import { timeout } from "rxjs/operators";
import { environment } from "src/enviroments/enviroment";
import { Page } from "../../shared/models/page";
import { ReturnResult } from "../../shared/models/return-result";
import { PagedData } from "../../shared/models/paged-data";

@Injectable({
    providedIn: 'root'
})

export class LeaveRequestManagementService {
    baseUrl = environment.apiLeaveRequestManagement;
    constructor(private http: HttpClient) { }

    getLeaveRequestPaging(page: Page, profileId: string = ''): Observable<ReturnResult<PagedData<LeaveRequestModel | any>>> {
        if (profileId == null) {
            // change null to empty to query BE
            profileId = '';
        }
        return this.http.post<ReturnResult<PagedData<LeaveRequestModel>>>(`${this.baseUrl}/get?profileId=${profileId}`, page);
    }

    getAllLeaveRequest(): Observable<ReturnResult<LeaveRequestModel[]>> {
        return this.http.get<ReturnResult<LeaveRequestModel[]>>(`${this.baseUrl}/GetAllLeaveRequest`);
    }

    getLeaveRequestById(leaveRequestId: number) {
        return this.http.get<ReturnResult<LeaveRequestModel>>(`${this.baseUrl}/GetLeaveRequestById?leaveRequestId=${leaveRequestId}`);
    }

    getLeaveRequestByProfileId(profileId: string) {
        return this.http.get<ReturnResult<LeaveRequestModel[]>>(`${this.baseUrl}/GetLeaveRequestByProfileId?profileId=${profileId}`);
    }

    getToDayLeaveRequestByProfileId(profileId: string) {
        return this.http.get<ReturnResult<LeaveRequestModel>>(`${this.baseUrl}/GetToDayLeaveRequestByProfileId?profileId=${profileId}`);
    }

    saveLeaveRequest(model: LeaveRequestModel): Observable<ReturnResult<LeaveRequestModel>> {
        const offset = new Date().getTimezoneOffset();
        model.timeZone = offset / - 60;
        return this.http.post<ReturnResult<LeaveRequestModel>>(`${this.baseUrl}/SaveLeaveRequest`, model);
    }

    saveLeaveBonus(model: LeaveBonusModel): Observable<ReturnResult<boolean>> {
        const offset = new Date().getTimezoneOffset();
        model.timeZone = offset / - 60;
        return this.http.post<ReturnResult<boolean>>(`${this.baseUrl}/SaveLeaveBonus`, model);
    }

    deleteLeaveRequest(id: string): Observable<ReturnResult<boolean>> {
        return this.http.delete<ReturnResult<boolean>>(`${this.baseUrl}/${id}`);
    }

    deleteLeaveRequests(id: number[]): Observable<ReturnResult<boolean>> {
        return this.http.post<ReturnResult<boolean>>(`${this.baseUrl}/Delete`, id);
    }

    exportLeaveRequest(page: Page): Observable<ReturnResult<any>> {
        return this.http.post<ReturnResult<any>>(`${this.baseUrl}/export`, page);
    }

    importLeaveRequest(formData: FormData): Observable<ReturnResult<any>> {
        return this.http.post<ReturnResult<any>>(`${this.baseUrl}/import`, formData).pipe(timeout(1200000));
    }
}