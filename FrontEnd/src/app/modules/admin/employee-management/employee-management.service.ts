import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReturnResult } from '../../shared/models/return-result';
import { environment } from 'src/enviroments/enviroment';
import { EmployeeModel } from '../../shared/models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeManagementService {
  baseUrl = environment.apiEmployeeManagement;

  constructor(private http: HttpClient) { }

  getEmployeePaging() {
    return this.http.get<ReturnResult<EmployeeModel[]>>(`${this.baseUrl}/GetEmployeePaging`);
  }
}
