import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { LeaveTypeModel } from "./leave-type-management.model";
import { environment } from "src/enviroments/enviroment";
import { ReturnResult } from "../../shared/models/return-result";

@Injectable({
    providedIn: 'root'
})

export class LeaveTypeManagementService {
    baseUrl = environment.apiLeaveTypeManagement;

    constructor(private http: HttpClient) { }

    getAllLeaveType(): Observable<ReturnResult<LeaveTypeModel[]>> {
        return this.http.get<ReturnResult<LeaveTypeModel[]>>(`${this.baseUrl}/GetAllLeaveType`);
    }

    // getLeaveTypePaging(page: Page): Observable<ReturnResult<PagedData<LeaveTypeModel>>> {
    //     return this.http.post<ReturnResult<PagedData<LeaveTypeModel>>>(`${this.baseUrl}/getLeaveType`, page);
    // }

    saveLeaveType(model: LeaveTypeModel): Observable<ReturnResult<LeaveTypeModel>> {
        return this.http.post<ReturnResult<LeaveTypeModel>>(`${this.baseUrl}/SaveLeaveType`, model);
    }

    deleteLeaveType(id: string): Observable<ReturnResult<boolean>> {
        return this.http.delete<ReturnResult<boolean>>(`${this.baseUrl}/DeleteLeaveType/${id}`);
    }

    deleteLeaveTypes(id: number[]): Observable<ReturnResult<boolean>> {
        return this.http.post<ReturnResult<boolean>>(`${this.baseUrl}/DeleteLeaveTypes`, id);
    }
}
