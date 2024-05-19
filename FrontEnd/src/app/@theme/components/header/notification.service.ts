import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReturnResult } from 'src/app/modules/shared/models/return-result';
import { environment } from 'src/enviroments/enviroment';
import { NotificationModel } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  baseUrl = environment.apiNotification;
  constructor(
    private http: HttpClient
  ) { }

  GetAllNotification(userId: String): Observable<ReturnResult<NotificationModel[]>> {
    return this.http.get<ReturnResult<NotificationModel[]>>(`${this.baseUrl}/GetAllNotification/${userId}`);
  }

  saveFCMToken(userId: String, token: String): Observable<ReturnResult<NotificationModel[]>> {
    return this.http.post<ReturnResult<NotificationModel[]>>(`${this.baseUrl}/saveFCMToken/${userId}`, { token });
  }

  markRead(userId: String, notificationId: String = ''): Observable<ReturnResult<NotificationModel[]>> {
    return this.http.post<ReturnResult<NotificationModel[]>>(`${this.baseUrl}/saveFCMToken/${userId}/${notificationId}`, {});
  }

}
