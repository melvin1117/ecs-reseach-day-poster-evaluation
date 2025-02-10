import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FileUploadStatus {
  eventId: string;
  hasJudges: boolean;
  hasPosters: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadCheckerService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Checks if files have been uploaded for a given event.
   * Calls: GET /upload/check?eventId=...
   */
  checkFileUploads(eventId: string): Observable<FileUploadStatus> {
    return this.http.get<FileUploadStatus>(`${this.apiUrl}/file-upload/check?eventId=${eventId}`);
  }
}
