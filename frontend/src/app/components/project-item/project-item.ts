import { Component, EventEmitter, Input, Output, inject} from '@angular/core';
import { Project } from '../../interfaces/project';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/authService';


@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [DatePipe,CommonModule],
  templateUrl: './project-item.html',
  styleUrl: './project-item.scss',
})
export class ProjectItem {

  @Input() project!: Project;
  @Output() onEdit = new EventEmitter<Project>();
  router=inject(Router);
  authService = inject(AuthService);
 
  openEdit(event: Event) {
    event.stopPropagation();
    this.onEdit.emit(this.project);
  }

  goToIssues(projectId: number) {
    this.router.navigate(['/issueList',projectId]); 
  }

}
