import { HostListener, Component, computed, inject, signal } from '@angular/core';
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


  @HostListener('document:click')
  closeStatusMenu() {
    this.statusMenuOpen.set(false);
  }

  issue = signal<Issue | null>(null);
  statusMenuOpen = signal(false);
  isImageModalOpen = signal(false);

  comments = computed(() => this.commentService.comments());
  url = this.commentService.url;
  issueId = this.commentService.issueId;


  newComment = false;


  readonly statuses: { value: Issue['status']; label: string; color: string} [] = [
    { value: 'todo', label: 'To Do', color: '#8b5cf6' },
    { value: 'open', label: 'Open', color: '#ef4444' },
    { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'closed', label: 'Closed', color: '#22c55e' },
  ];


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

  get currentStatus() {
    return this.statuses.find(s => s.value === this.issue()?.status) ?? this.statuses[0];
  }

  toggleStatusMenu(event: MouseEvent) {
    event.stopPropagation();
    setTimeout(() => { this.statusMenuOpen.update(v => !v); }, 0);
  }



  changeStatus(newStatus: Issue['status']) {
    const id = this.issue()?.issueId;
    if (!id) return;
    this.api.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.issue.update(i => i ? { ...i, status: newStatus } : null);
        this.statusMenuOpen.set(false);
        this.toast.success('Status updated');
      },
      error: () => this.toast.error('Could not update status')
    });
  }

  get nextAllowedStatus(): Issue['status'] | null {
    const transitions: Record<string, Issue['status']> = {
      'todo': 'open',
      'open': 'in_progress',
      'in_progress': 'closed',
    };
    return transitions[this.issue()?.status ?? ''] ?? null;
  }

  get isCreator(): boolean {
    return this.authService.user()?.id === this.issue()?.userId;
  }


}
