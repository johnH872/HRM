import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReturnResult } from '../../shared/models/return-result';
import { environment } from 'src/enviroments/enviroment';
import { EmployeeModel } from '../../shared/models/employee.model';
import { User } from '../../shared/models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeManagementService {
  baseUrl = environment.apiEmployeeManagement;

  constructor(private http: HttpClient) { }

  getAllEmployee(): Observable<ReturnResult<EmployeeModel[]>> {
    return this.http.get<ReturnResult<EmployeeModel[]>>(`${this.baseUrl}/GetAllEmployee`);
  }

  saveEmployee(model: EmployeeModel): Observable<ReturnResult<EmployeeModel>> {
    return this.http.post<ReturnResult<EmployeeModel>>(`${this.baseUrl}/SaveEmployee`, model);
  }
}
