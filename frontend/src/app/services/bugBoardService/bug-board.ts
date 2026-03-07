import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Issue } from '../../models/models'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BugBoard {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient){}

  getIssues(filters?: any): Observable<Issue[]> {

    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.set(key, filters[key]);
      });
    }
    return this.http.get<Issue[]>(`${this.apiUrl}/getIssues`, {params});
  }

  updateStatus(issueId: number, status: string) {
    return this.http.patch(`${this.apiUrl}/update-status`, { issueId, status });
  }
  
}
