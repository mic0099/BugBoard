import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { LoginResponse } from '../../interfaces/login-response'; 
import { LoginRequest } from '../../interfaces/login-request';

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
    const url = 'http://localhost:3000/login'; 
    return this.http.post<LoginResponse>(url,user,this.HttpOption); 
}

}