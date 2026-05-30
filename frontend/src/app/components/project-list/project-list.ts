import { Component, inject, OnInit } from '@angular/core';
import { ProjectItem } from '../project-item/project-item';
import { BugBoard } from '../../services/bugBoardService/bug-board'
import { Project } from '../../interfaces/project'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/authService';
import { Projectedit } from '../project-edit/project-edit';


@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [ProjectItem,CommonModule,Projectedit], 
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList implements OnInit{

  selectedProject: Project | null = null;

  authService=inject(AuthService); 
  projects: Project[] = []; 
  route=inject(Router);

  constructor(private projectService: BugBoard) {}

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

  newUser(){
    this.route.navigate(["/addUser"]); 
 }


  openEditModal(project: Project) {
    this.selectedProject = project; 
  }

  closeModal() {
    this.selectedProject = null;
  } 

  onProjectUpdated(){
    this.loadProjects(); 
    this.closeModal(); 
  }


}
