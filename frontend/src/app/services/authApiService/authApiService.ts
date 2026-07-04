import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { LoginResponse } from '../../interfaces/login-response'; 
import { LoginRequest } from '../../interfaces/login-request';
import { User } from '../../interfaces/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
     
   private http = inject(HttpClient)

private readonly HttpOption={
     headers: new HttpHeaders({
         'Content-Type': 'application/json'
     }),
     withCredentials:true,
}

login(user:LoginRequest){
    const url = `${environment.apiUrl}/login`;
    return this.http.post<LoginResponse>(url,user,this.HttpOption); 
}

addUser(user:User){
    const url = `${environment.apiUrl}/register`;
    return this.http.post<User>(url,user,this.HttpOption); 
}

logout(){
    const url = `${environment.apiUrl}/logout`;
    return this.http.post<{message:string}>(url,{},this.HttpOption); 

}

}