import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Issue } from '../../interfaces/issue'
import { Project } from '../../interfaces/project'
import { Observable } from 'rxjs'; 
import { Newcomment } from '../../interfaces/newcomment'; 
import { issueComments } from '../../interfaces/issueComment'; 
import { CreateProjectRequest } from '../../interfaces/create-project-request';
import { CreateIssueRequest } from '../../interfaces/create-issue-request';

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

 
getIssueById(issueId: number): Observable<Issue> {
  return this.http.get<Issue>(`${this.apiUrl}/issues/${issueId}`);
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

  getProjects():Observable<Project[]> {
   return this.http.get<Project[]>(`${this.apiUrl}/getProjects`);
  } 
 
  addProject(project:CreateProjectRequest){
     return this.http.post<any>(`${this.apiUrl}/addProject`,project);
  }

  checkEmailExists(email: string) {
    return this.http.get<{exists: boolean}>(`${this.apiUrl}/verifyEmail`, { params: { email } });
  }

  updateProject(projectId: number, data: { name?: string, emails?: string[] }): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateProject/${projectId}`, data);
  }

  addIssue(issue:CreateIssueRequest){
    return this.http.post<CreateIssueRequest>(`${this.apiUrl}/addIssue`,issue);  
  }

  addImageForIssue(issueId: number, image: File) {
    const formData = new FormData();
    formData.append('image', image);

   return this.http.post(`${this.apiUrl}/issues/${issueId}/image`, formData);
  }

  addTags(issueId: number, tags: string[]){
     return this.http.post<{message:string}>(`${this.apiUrl}/issues/${issueId}/tags`,{tags})
  }

getIssuesByTag(projectId: number, tag: string) {
  return this.http.get<Issue[]>(`${this.apiUrl}/issues/by-tag`, {
    params: {
      projectId,
      content: tag
    }
  });
}

}
