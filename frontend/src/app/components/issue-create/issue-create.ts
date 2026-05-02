import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BugBoard } from '../../services/bugBoardService/bug-board';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { CreateIssueRequest } from '../../interfaces/create-issue-request';
import { catchError, EMPTY, of, switchMap } from 'rxjs'; 
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-issue-create',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './issue-create.html',
  styleUrl: './issue-create.scss', 
})
export class IssueCreate { 

  route = inject(ActivatedRoute); 
  router = inject(Router);
  projectId!: number;
  toastr=inject(ToastrService); 
  api=inject(BugBoard); 
  selectedFile: File | null = null;
  
  issue = new FormGroup({
    title: new FormControl('', {
      nonNullable:true,
      validators:[
       Validators.required, 
       Validators.minLength(3), 
       Validators.maxLength(15), 
    ]}),

    description: new FormControl('', {
      nonNullable:true,
      validators:[
       Validators.required, 
       Validators.minLength(10), 
       Validators.maxLength(200), 
    ]}),

   priority: new FormControl<string>('low', {
     nonNullable: true,
     validators: [
      Validators.required,
      Validators.pattern(/^(low|medium|high|blocker)$/)
    ]
  }),

  type: new FormControl<string>('bug', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^(question|bug|documentation|feature)$/)
    ]
  }),

  status: new FormControl<string>('open', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^(open|todo|in_progress)$/)
    ]
  }),
  tags: new FormArray<FormControl<string>>([])
}) 

ngOnInit(){
  this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
}

onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
} 

addtags() { 
  this.tags.push(
    new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(20)
      ]
    })
  );
}

  get tags() {
    return this.issue.get('tags') as FormArray<FormControl<string>>;
  } 

removeFile(input: HTMLInputElement) {
  this.selectedFile = null;
  input.value = '';
}

onSubmit(){

  const titleErr = this.issue.get("title")?.errors; 
  const descriptionErr = this.issue.get("description")?.errors; 
  const typeErr = this.issue.get("type")?.errors; 
  const statusErr = this.issue.get("status")?.errors; 
  const priorityErr = this.issue.get("priority")?.errors;  
  const tagsArray = this.issue.get('tags') as FormArray;


  if(titleErr){
    this.toastr.error("Please enter a valid title"); 
    return; 
  }

  if(descriptionErr){
    this.toastr.error("Please enter a valid description"); 
    return;    
  } 

  if(typeErr){
    this.toastr.error("Please enter a valid type"); 
    return;    
  }

  if(statusErr){
    this.toastr.error("Please enter a valid status"); 
    return;    
  }

  if(priorityErr){
    this.toastr.error("Please enter a valid priority"); 
    return;    
  }

 const filteredTags = this.tags.controls
  .filter(c => !c.invalid && c.value.trim() !== '')
  .map(c => c.value.trim());

  const issueData: CreateIssueRequest = {
    ...this.issue.getRawValue(),
    projectId: this.projectId, 
    priority: this.issue.value.priority as 'low' | 'medium' | 'high' | 'blocker',
    type: this.issue.value.type as 'question' | 'bug' | 'documentation' | 'feature',
    status: this.issue.value.status as 'open' | 'todo' | 'in_progress', 
  };
 

  this.api.addIssue(issueData).pipe(

  switchMap((res: any) => {

    const issueId = res.issueId || res.issue?.issueId;

    let tags$ = of(res);

    //STEP 1: TAGS (solo se presenti)
    if (filteredTags.length > 0) {
      tags$ = this.api.addTags(issueId, filteredTags);
    }

    return tags$.pipe(

      //STEP 2: IMAGE
      switchMap(() => {

        if (!this.selectedFile) {
          return of(res);
        }

        return this.api.addImageForIssue(issueId, this.selectedFile);

      }),

      catchError(() => {
        this.toastr.error("Something went wrong");
        return of(res);
      })

    );

  }),

  catchError(() => {
    this.toastr.error("Something went wrong");
    return EMPTY;
  })

).subscribe({

    next: () => {
      this.toastr.success("issue created successfully");
      const id = this.projectId;
    }
  })
}

onCancel() {
  const id = this.projectId;
  if (id) {
    this.router.navigate(['/projects', id, 'issues']);
  } else {
    this.router.navigate(['/projectList']);
  }
}





}
