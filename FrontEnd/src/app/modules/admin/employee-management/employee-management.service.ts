import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReturnResult } from '../../shared/models/return-result';
import { environment } from 'src/enviroments/enviroment';
import { EmployeeModel } from '../../shared/models/employee.model';
import { User } from '../../shared/models/user.model';
import { Observable } from 'rxjs';
import { DashBoardData } from '../dashboard/dashboard-data.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeManagementService {
  baseUrl = environment.apiEmployeeManagement;

  constructor(private http: HttpClient) { }

  getAllEmployee(): Observable<ReturnResult<EmployeeModel[]>> {
    return this.http.get<ReturnResult<EmployeeModel[]>>(`${this.baseUrl}/GetAllEmployee`);
  }

  getEmployeeCurrentUserRole(roles: String[]): Observable<ReturnResult<EmployeeModel[]>> {
    return this.http.post<ReturnResult<EmployeeModel[]>>(`${this.baseUrl}/GetEmployeeCurrentUserRole`, roles);
  }

  saveEmployee(model: EmployeeModel): Observable<ReturnResult<EmployeeModel>> {
    return this.http.post<ReturnResult<EmployeeModel>>(`${this.baseUrl}/SaveEmployee`, model);
  }

  getEmployeeById(employeeId: string): Observable<ReturnResult<EmployeeModel>> {
    return this.http.get<ReturnResult<EmployeeModel>>(`${this.baseUrl}/getEmployeeById/${employeeId}`);
  }

  getOwnersByEmployeeId(employeeId: string): Observable<ReturnResult<EmployeeModel[]>> {
    return this.http.get<ReturnResult<EmployeeModel[]>>(`${this.baseUrl}/GetOwnersByEmployeeId?employeeId=${employeeId}`);
  }

  deleteEmployees(ids: String[]): Observable<ReturnResult<EmployeeModel[]>> {
    return this.http.post<ReturnResult<EmployeeModel[]>>(`${this.baseUrl}/DeleteEmployee`, ids);
  }

  getDashboardData(id: String, email: String): Observable<ReturnResult<DashBoardData>> {
    return this.http.get<ReturnResult<DashBoardData>>(`${this.baseUrl}/GetDashboardData?employeeId=${id}&myEmail=${email}`);
  }
}
