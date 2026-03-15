import { Component, computed, inject } from '@angular/core';
import { CommentService } from '../../services/commentService/commentService';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BugBoard } from '../../services/bugBoardService/bug-board';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; 
import { issueComments } from '../../interfaces/issueComment';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-issue-comments',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './issue-comments.html',
  styleUrl: './issue-comments.scss',
})
export class IssueComments {

  commentService = inject(CommentService) 
  api=inject(BugBoard);
  toast=inject(ToastrService); 
  route=inject(ActivatedRoute); 

   comments = computed(() => this.commentService.comments());
   url = this.commentService.url;
   issueId = this.commentService.issueId;

  // === Stato locale ===
  newComment = false;

  // === Form ===
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
    this.commentService.loadComments(id); 
    this.commentService.loadImage(id); 
  }
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

  // === TrackBy per performance nel template ===
  trackByComment(index: number, comment: issueComments): number {
    return comment.commentId;
  }
}
