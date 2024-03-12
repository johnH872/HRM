import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenerateLeaveEntitlementModel, LeaveEntitlementModel, LeaveEntitlementViewModel } from "./leave-entitlement-management.model";
import { environment } from "src/enviroments/enviroment";
import { ReturnResult } from "../../shared/models/return-result";

@Injectable({
    providedIn: 'root'
})

export class LeaveEntitlementManagamentService {
    baseUrl = environment.apiLeaveEntitlementManagement;
    constructor(private http: HttpClient) { }

    getAllLeaveEntitlement(): Observable<ReturnResult<LeaveEntitlementModel[]>> {
        return this.http.get<ReturnResult<LeaveEntitlementModel[]>>(`${this.baseUrl}/GetAllLeaveEntitlement`);
    }

    saveLeaveEntitlement(model: LeaveEntitlementModel): Observable<ReturnResult<LeaveEntitlementModel>> {
        return this.http.post<ReturnResult<LeaveEntitlementModel>>(`${this.baseUrl}/SaveLeaveEntitlement`, model);
    }

    deleteLeaveEntitlement(id: string): Observable<ReturnResult<boolean>> {
        return this.http.delete<ReturnResult<boolean>>(`${this.baseUrl}/DeleteLeaveEntitlement/${id}`);
    }

    deleteLeaveEntitlements(id: number[]): Observable<ReturnResult<boolean>> {
        return this.http.post<ReturnResult<boolean>>(`${this.baseUrl}/DeleteLeaveEntitlements`, id);
    }

    getLeaveEntitlementById(employeeId: string) {
        return this.http.get<ReturnResult<LeaveEntitlementModel[]>>(`${this.baseUrl}/GetLeaveEntitlementById?employeeId=${employeeId}`);
    }

    getLeaveEntitlementByIdToTransfer(employeeId: string) {
        return this.http.get<ReturnResult<LeaveEntitlementModel[]>>(`${this.baseUrl}/GetLeaveEntitlementByIdToTransfer?employeeId=${employeeId}`);
    }

    getYearOfLeaveEntitlement() {
        return this.http.get<ReturnResult<number[]>>(`${this.baseUrl}/GetYearOfLeaveEntitlement`);
    }

    getTotalLeaveEntitlementById(employeeId: string) {
        return this.http.get<ReturnResult<LeaveEntitlementViewModel>>(`${this.baseUrl}/GetTotalLeaveEntitlementById?employeeId=${employeeId}`);
    }

    generateLeaveEntitlement(model: GenerateLeaveEntitlementModel): Observable<ReturnResult<boolean>> {
        return this.http.post<ReturnResult<boolean>>(`${this.baseUrl}/GenerateLeaveEntitlement`, model);
    }
}