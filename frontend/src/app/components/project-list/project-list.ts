import { Component, inject, OnInit } from '@angular/core';
import { ProjectItem } from '../project-item/project-item';
import { BugBoard } from '../../services/bugBoardService/bug-board'
import { Project } from '../../interfaces/project'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/authService';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [ProjectItem,CommonModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList implements OnInit{
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

}
