import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject} from '@angular/core';
import { Issue } from '../../models/models'
import { CommentService } from '../../services/commentService/commentService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-issue-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-item.html',
  styleUrl: './issue-item.scss',
})
export class IssueItem {

@Input() issue!: Issue;
comment=inject(CommentService); 
router=inject(Router);

  onComments(){
      this.comment.saveIssueAndComments(this.issue.Image?.url ?? '',this.issue.issueId);
      this.router.navigate(['/comments',this.issue.issueId]); 
  }

}
 