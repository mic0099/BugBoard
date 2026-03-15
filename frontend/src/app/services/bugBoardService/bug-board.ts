import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Issue } from '../../models/models'
import { Observable } from 'rxjs'; 
import { Newcomment } from '../../interfaces/newcomment'; 
import { issueComments } from '../../interfaces/issueComment';

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

  addComment(comment:Newcomment){
    return this.http.post<issueComments>(`${this.apiUrl}/comments`,comment); 
  }

  getComment(issueId:number){
    return this.http.get<issueComments[]>(`${this.apiUrl}/issues/${issueId}/comments`);
  }
  
  getImage(issueId:number){
    return this.http.get<{url:string}>(`${this.apiUrl}/issues/${issueId}/image`)
  }

}
