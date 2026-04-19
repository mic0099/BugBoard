import { Component, computed, inject, signal } from '@angular/core';
import { CommentService } from '../../services/commentService/commentService';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BugBoard } from '../../services/bugBoardService/bug-board';
import { AuthService } from '../../services/authService/authService';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; 
import { issueComments } from '../../interfaces/issueComment';
import { Issue } from '../../interfaces/issue';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-issue-comments',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './issue-comments.html',
  styleUrl: './issue-comments.scss',
})
export class IssueComments {

  commentService = inject(CommentService) ;
  api=inject(BugBoard);
  authService = inject(AuthService);
  toast=inject(ToastrService); 
  route=inject(ActivatedRoute); 

  issue = signal<Issue | null>(null);
  isImageModalOpen = signal(false);

  comments = computed(() => this.commentService.comments());
  url = this.commentService.url;
  issueId = this.commentService.issueId;


  newComment = false;


  commentForm = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(100),
    ]),
  }); 

  ngOnInit() {
  const id = Number(this.route.snapshot.paramMap.get('id')); ;
  if (id) {
    this.commentService.issueId.set(id); 
    this.loadIssueData(id);
    this.commentService.loadComments(id); 
    this.commentService.loadImage(id); 
  }
}

loadIssueData(id: number) {
  this.api.getIssueById(id).subscribe({
    next: (data) => {
      this.issue.set(data);
    },
    error: (err) => {
      this.toast.error("Could not load issue details");
      console.error(err);
    }
  });
}

  addComment() {
  const commentError = this.commentForm.get('content')?.errors; //controllo errori legati al form 
  if (commentError) {
    this.toast.error('The comment cannot be empty and can contain a maximum of 100 characters');
    return;
  }

  this.api.addComment({content:this.commentForm.get('content')?.value as string, issueId:this.issueId()}).subscribe({ //chiamata al back
    next: (res) => {//riceve la lista di commenti 
      // aggiorna direttamente il Signal nel service
      console.log(res);
      this.commentService.comments.update(c => [res, ...c]);
      this.newComment = true;
      this.commentForm.reset();
    },
    error: (err: HttpErrorResponse) => {
      let msg = 'An error occurred, please try again';
      if (err.status === 0) {
        msg = 'Unable to connect to the server. Please check your connection';
      }
      this.toast.error(msg);
    },
  });
}

 
  trackByComment(index: number, comment: issueComments): number {
    return comment.commentId;
  }

  toggleModal() {
    this.isImageModalOpen.update(v => !v);
  }

  closeIssue() {
    const id = this.issue()?.issueId;
    if (!id) return;
  
  
    this.api.closeIssue(id).subscribe({
      next: () => {
        this.toast.success("Issue marked as resolved");
        this.issue.update(current => current ? { ...current, status: 'closed' } : null);
      },
      error: (err) => {
        this.toast.error("Could not close the issue");
      }
    });
  }

  get currentUserId(): string | undefined {
    return this.authService.user()?.id;
  }
}
