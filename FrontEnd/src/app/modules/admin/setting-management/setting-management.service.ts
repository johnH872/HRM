import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { environment } from "src/enviroments/enviroment";
import { ReturnResult } from "../../shared/models/return-result";
import { EditSettingModel, SettingModel } from "./setting-management.model";

@Injectable({
    providedIn: 'root'
})

export class SettingManagementService {
    baseUrl = environment.apiSettingManagement;

    constructor(private http: HttpClient) { }

    getAllSetting(): Observable<ReturnResult<SettingModel[]>> {
        return this.http.get<ReturnResult<SettingModel[]>>(`${this.baseUrl}/GetAllSetting`);
    }

    getSettingByKeyAndGroup(key: string, group: string): Observable<ReturnResult<SettingModel>> {
        return this.http.get<ReturnResult<SettingModel>>(`${this.baseUrl}/GetSettingByKeyAndGroup?key=${key}&group=${group}`);
    }

    getSettingByGroup(group: string): Observable<ReturnResult<SettingModel[]>> {
        return this.http.get<ReturnResult<SettingModel[]>>(`${this.baseUrl}/GetSettingByGroup?group=${group}`,)
    }

    saveSetting(model: EditSettingModel): Observable<ReturnResult<SettingModel>> {
        return this.http.post<ReturnResult<SettingModel>>(`${this.baseUrl}/SaveSetting`, model);
    }

    deleteSetting(id: string): Observable<ReturnResult<boolean>> {
        return this.http.delete<ReturnResult<boolean>>(`${this.baseUrl}/DeleteSetting/${id}`);
    }

    deleteSettings(id: number[]): Observable<ReturnResult<boolean>> {
        return this.http.post<ReturnResult<boolean>>(`${this.baseUrl}/DeleteSettings`, id);
    }
}
