import { Component, OnInit } from '@angular/core';
import { ProjectItem } from '../project-item/project-item';
import { BugBoard } from '../../services/bugBoardService/bug-board'
import { Project } from '../../interfaces/project'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [ProjectItem,CommonModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList implements OnInit{

  projects: Project[] = [];

    constructor(private projectService: BugBoard) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(){
    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
    });
  }

}
