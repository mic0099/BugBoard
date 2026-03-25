import { Component, inject, OnInit } from '@angular/core';
import { ProjectItem } from '../project-item/project-item';
import { BugBoard } from '../../services/bugBoardService/bug-board'
import { Project } from '../../interfaces/project'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/authService';
import { ReactiveFormsModule , FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [ProjectItem,CommonModule, ReactiveFormsModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList implements OnInit{
  isEditModalOpen = false;
  selectedProject: Project | null = null;
  editData = {name: ''};
  newMemberEmail = '';
  emailsToRemove: string[] = [];

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  authService=inject(AuthService); 
  projects: Project[] = []; 
  route=inject(Router);

  constructor(private projectService: BugBoard) {}

  editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    newEmail: ['', [Validators.email]]
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(){
    this.projectService.getProjects().subscribe(data => { 
      console.log("DATA:", data);
      this.projects = data;
    });
  } 

  newProject(){
     this.route.navigate(["/newproject"]); 
  }

  openEditModal(project: Project) {
    this.selectedProject = project;
    this.emailsToRemove = [];
    this.editForm.patchValue({
      name: project.name,
      newEmail: ''
    })
    this.isEditModalOpen = true; 
  }

  closeModal() {
    this.isEditModalOpen = false;
    this.selectedProject = null;
    this.editForm.reset(); 
  this.emailsToRemove = [];
  }

  toggleRemoveMember(email:string) {
    if(this.emailsToRemove.includes(email)) {
      this.emailsToRemove = this.emailsToRemove.filter(e => e !== email);

    }else{
      this.emailsToRemove.push(email);
    }
  }

  isMarkedForRemoval(email:string): boolean {
    return this.emailsToRemove.includes(email);
  }

  saveProject() {
    if(!this.selectedProject) return;

    const formValues = this.editForm.value;
    const payload: any = {};

    if (formValues.name != this.selectedProject.name) payload.name = formValues.name;
    if ( formValues.newEmail && formValues.newEmail.trim() !== '') payload.emails =  [formValues.newEmail];
    if (this.emailsToRemove.length>0) payload.removeEmails = this.emailsToRemove;

    if (Object.keys(payload).length === 0) {
      this.closeModal();
      return;
    }

    this.projectService.updateProject(this.selectedProject.projectId, payload).subscribe({
      next: (response) => {
        this.toastr.success("Project updated successfully");
        this.loadProjects();
        this.closeModal();
        this.emailsToRemove=[];
      },
      error: (err) => alert("Error during update")
    })
  }

}
