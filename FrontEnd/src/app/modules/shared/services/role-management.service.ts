import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/enviroment';
import { RoleModel } from '../models/role-model';
import { ReturnResult } from '../models/return-result';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleManagementService {
  baseUrl = environment.apiRoleManagement;
  constructor(
    private http: HttpClient,
  ) { }
  
  getRoles(): Observable<ReturnResult<RoleModel[]>> {
    return this.http.get<ReturnResult<RoleModel[]>>(`${this.baseUrl}/GetRoles`);
  }

  saveRole(model: RoleModel): Observable<ReturnResult<RoleModel[]>> {
    return this.http.post<ReturnResult<RoleModel[]>>(`${this.baseUrl}/SaveRole`, model);
  }

  deleteRoles(removeIds: String[]): Observable<ReturnResult<RoleModel[]>> {
    return this.http.post<ReturnResult<RoleModel[]>>(`${this.baseUrl}/DeleteRoles`, removeIds);
  }
}
