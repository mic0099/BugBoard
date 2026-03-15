import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';  
import { AuthApiService } from '../../services/authApiService/authApiService'; 
import { AuthService } from '../../services/authService/authService';
import { tap } from 'rxjs';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
 authApi = inject(AuthApiService); 
 auth=inject(AuthService); 
 router = inject(Router); 
 toastr= inject(ToastrService); 


 loginForm = new FormGroup({
     email : new FormControl('',[Validators.required,
        Validators.email, 
     ]), 
     password: new FormControl('',[Validators.required,
         Validators.minLength(8), 
         Validators.maxLength(64), 
         Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/) 
     ]),
     rememberMe: new FormControl<boolean>(false,{nonNullable:true}),
 })

onSubmit(){
    const errEmail = this.loginForm.get('email')?.errors; 
    const errPdw = this.loginForm.get('password')?.errors; 

    if(errEmail){
      this.toastr.error('the email field is required'); 
      return;
    }
    if(errPdw){
      this.toastr.error('Password must include a lowercase, an uppercase, a number, and no spaces');  
      return;
    } 

    this.authApi.login({ //chiama il back
       email: this.loginForm.value.email as string, //valore passato al back 
       password: this.loginForm.value.password as string, //valore passato al back 
       rememberMe: this.loginForm.value.rememberMe as boolean, //valore passato al back 
    })
    .pipe( //metodo degli observables, utilizzato per collegare una serie di operatori come map o tap 
      tap(res => { //fa un azione collaterale 
        if(String(this.loginForm.value.rememberMe)==='true'){
          localStorage.setItem("ricordami",String(this.loginForm.value.rememberMe));
        }else if(String(this.loginForm.value.rememberMe)==='false'){
          sessionStorage.setItem("ricordami",String(this.loginForm.value.rememberMe));
        }
         this.auth.updateToken(res.accessToken); 
      }), 
      
    )
    .subscribe({
       error: (err:HttpErrorResponse) =>{
         let msg: string = "An error occurred, please try again";
           if(err.status===0){
            msg="Unable to connection to server. Please check your connection";
          } 
           if(err.status===401){
            msg="invalid credentials. Please check your email and password"; 
          }
          this.toastr.error(msg); 
       },  
       complete: () =>{ 
          this.toastr.success("Login successful, welcome");  
          this.router.navigate(['/issueList']);
       }, 
    }) 

}
}
