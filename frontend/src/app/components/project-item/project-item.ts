import { Component, Input, inject} from '@angular/core';
import { Project } from '../../interfaces/project';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [DatePipe,],
  templateUrl: './project-item.html',
  styleUrl: './project-item.scss',
})
export class ProjectItem {

  @Input() project!: Project;
  router=inject(Router);

  goToIssues(projectId: number) {
    this.router.navigate(['/issueList',projectId]); 
  }

}
