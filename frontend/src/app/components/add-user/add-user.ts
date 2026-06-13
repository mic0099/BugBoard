import { Component, inject } from '@angular/core'; 
import { AuthApiService } from '../../services/authApiService/authApiService'; 
import { ToastrService } from 'ngx-toastr'; 
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  imports: [ReactiveFormsModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss',
})
export class AddUser {
     authApi = inject(AuthApiService); 
     toastr=inject(ToastrService); 
     router=inject(Router);

userAddForm = new FormGroup({
  email: new FormControl<string>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.email
    ]
  }),
  password: new FormControl<string>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(64),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
    ]
  }),
  name: new FormControl<string>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30)
    ]
  }),
  surname: new FormControl<string>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30)
    ]
  }),
  admin: new FormControl<boolean>(false, {
    nonNullable: true
  })
});

onSubmit(){
    const errEmail = this.userAddForm.get('email')?.errors; 
    const errPdw = this.userAddForm.get('password')?.errors; 
    const errName = this.userAddForm.get('name')?.errors; 
    const errSurname = this.userAddForm.get('surname')?.errors; 

    if(errEmail){
      this.toastr.error('the email is not valid'); 
      return;
    }
    if(errPdw){
      this.toastr.error('Password must include a lowercase, an uppercase, a number, and no spaces');  
      return;
    } 
    if(errName){
      this.toastr.error('name is not valid'); 
      return;
    }
    if(errSurname){
      this.toastr.error('surname is not valid'); 
      return;
    }

    const user: User = this.userAddForm.getRawValue()

this.authApi.addUser(user)
 .subscribe({
  next: (data) =>{
    this.toastr.success("user created"); 
    this.userAddForm.reset({ admin: false }); 
    this.router.navigate(['/projectList'],{ replaceUrl: true }); 
  }, 

  error: (err) => {
    let msg: string = "An error occurred, please try again";
    if(err.status===0){
      msg="Unable to connection to server. Please check your connection";
    } 
    if(err.status===400){
      msg="invalid data. Please check the entered data"; 
      }
    this.toastr.error(msg); 
  }   
 })

} 

onCancel(){
   this.router.navigate(["/projectList"])
}



}
