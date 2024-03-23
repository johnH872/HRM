import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/enviroment';
import { DateRangeModel } from '../../shared/models/dateRangeModel';
import { Observable } from 'rxjs';
import { ReturnResult } from '../../shared/models/return-result';
import { AttendanceModel } from './attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceManagementService {
  baseUrl = environment.apiAttendanceManagement;
  constructor(
    private http: HttpClient
  ) { }

  getAttendanceByEmployeeId(id: string, dateRange: DateRangeModel): Observable<ReturnResult<AttendanceModel[]>> {
    return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/GetAttendanceByEmployeeId/${id}`, dateRange)
  }

  punchInOut(isPunchIn: boolean, id: string, model: AttendanceModel): Observable<ReturnResult<AttendanceModel[]>> {
    return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/PunchInOut/${isPunchIn}/${id}`, model)
  }
}
