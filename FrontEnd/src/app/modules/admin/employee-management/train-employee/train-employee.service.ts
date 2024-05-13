import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReturnResult } from 'src/app/modules/shared/models/return-result';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class TrainEmployeeService {
  baseUrl = environment.apiFaceRecog;
  uploadImageUrl = environment.apiMediaManagement
  constructor(
    private http: HttpClient
  ) { }

  traningUserFace(userId: String, files: File[]): Observable<ReturnResult<boolean>> {
    const formData: FormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    return this.http.post<ReturnResult<boolean>>(`${this.baseUrl}/TraningUserFace/${userId}`, formData);
  }

  uploadImage(userId: String, file: File): Observable<ReturnResult<boolean>> {
    var formData: FormData = new FormData();
    formData.append('image', file);
    return this.http.post<ReturnResult<boolean>>(`${this.uploadImageUrl}/UploadProfileAvatar/${userId}`, formData);
  }
}
