import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/enviroment';
import { DateRangeModel } from '../../shared/models/dateRangeModel';
import { Observable } from 'rxjs';
import { ReturnResult } from '../../shared/models/return-result';
import { AttendanceModel } from './attendance.model';
import { ReportAttendanceModel } from '../../face-recog/punch-in-out-webcam/report-attendance-dialog/report-attendance.model';
import { PagingRangeDateFilter } from '../../shared/models/page';

@Injectable({
  providedIn: 'root'
})
export class AttendanceManagementService {
  baseUrl = environment.apiAttendanceManagement;
  constructor(
    private http: HttpClient
  ) { }

  getAllAttendance(): Observable<ReturnResult<AttendanceModel[]>> {
    return this.http.get<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/GetAllAttendance`);
  }

  saveAttendance(model: AttendanceModel): Observable<ReturnResult<AttendanceModel>> {
    return this.http.post<ReturnResult<AttendanceModel>>(`${this.baseUrl}/SaveAttendance`, model);
  }

  getAttendanceByEmployeeId(id: string, dateRange: DateRangeModel): Observable<ReturnResult<AttendanceModel[]>> {
    return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/GetAttendanceByEmployeeId/${id}`, dateRange)
  }

  punchInOut(isPunchIn: boolean, id: string, model: AttendanceModel, image: File): Observable<ReturnResult<AttendanceModel[]>> {
    const formData: FormData = new FormData();
    formData.append('image', image);
    formData.append('model', JSON.stringify(model));
    return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/PunchInOut/${isPunchIn}/${id}`, formData)
  }

  sendAttendanceReport(image: File, model: ReportAttendanceModel): Observable<ReturnResult<AttendanceModel[]>> {
    const formData: FormData = new FormData();
    formData.append('image', image);
    formData.append('email', model.email as string);
    formData.append('note', model.note as string);
    formData.append('type', model.type as string);
    return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/SendAttendanceReport`, formData)
  }

  getAllAttendanceReport(email: String): Observable<ReturnResult<ReportAttendanceModel[]>> {
    return this.http.get<ReturnResult<ReportAttendanceModel[]>>(`${this.baseUrl}/GetAllAttendanceReport/${email}`)
  }

  saveAttendanceReport(model: ReportAttendanceModel, userId: String=''): Observable<ReturnResult<ReportAttendanceModel[]>> {
    return this.http.post<ReturnResult<ReportAttendanceModel[]>>(`${this.baseUrl}/SaveAttendanceReport?userId=${userId}`, model)
  }

  deleteAttendanceReport(ids: number[]): Observable<ReturnResult<ReportAttendanceModel[]>> {
    return this.http.post<ReturnResult<ReportAttendanceModel[]>>(`${this.baseUrl}/DeleteAttendanceReport`, ids)
  }

  deleteAttendance(ids: number[]): Observable<ReturnResult<AttendanceModel[]>> {
    return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/DeleteAttendance`, ids)
  }

  getAttendanceRange(userId: string, page: PagingRangeDateFilter): Observable<ReturnResult<AttendanceModel[]>> {
    return this.http.post<ReturnResult<AttendanceModel[]>>(`${this.baseUrl}/GetAttendanceRange?userId=${userId}&timezone=${new Date().getTimezoneOffset()/60}`, page);
  }
}
