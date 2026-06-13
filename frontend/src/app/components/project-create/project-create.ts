import { Component, inject } from '@angular/core'; 
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BugBoard } from '../../services/bugBoardService/bug-board';
import { CreateProjectRequest } from '../../interfaces/create-project-request';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-create',
  imports: [ReactiveFormsModule,CommonModule], 
  templateUrl: './project-create.html',
  styleUrl: './project-create.scss', 
})
export class ProjectCreate { 

  toast = inject(ToastrService); 
  api = inject(BugBoard); 
  router = inject(Router)
      
    newProject = new FormGroup ({

       name: new FormControl<string>('',{
        nonNullable:true,
         validators:[
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]}), 

        emails: new FormArray<FormControl<string>>([])

    })

    get emails() {
       return this.newProject.get('emails') as FormArray<FormControl<string>>;
    }    

    addEmail() {
    this.emails.push(
      new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email
        ]
      })
    );
  } 

  removeEmail(index: number) {
  this.emails.removeAt(index);
}

  onSubmit(){
    const errName = this.newProject.get("name")?.errors; 
    const emailArray = this.newProject.get('emails') as FormArray;
    const errEmail = emailArray.controls.some(c => c.invalid);

    if(errName){
        this.toast.error("name is not valid"); 
        return; 
    } 

    if(errEmail){
      this.toast.error("Please enter a valid email address"); 
      return; 
    } 

  const project: CreateProjectRequest = {
    ...this.newProject.getRawValue(),
    emails: this.emails.value.filter(e => e && e.trim() !== '')
  };

    this.api.addProject(project)
     .subscribe({
       next: (res) => {
         this.toast.success(res.message); 
         this.newProject.reset(); 
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
      this.toast.error(msg); 
      }
     })
  } 

  onCancel(){
    this.router.navigate(["/projectList"])
  }


}
