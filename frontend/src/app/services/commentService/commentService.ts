import { inject, Injectable, signal } from '@angular/core';
import { issueComments } from '../../interfaces/issueComment';
import { BugBoard } from '../bugBoardService/bug-board';

@Injectable({
  providedIn: 'root',
})
export class CommentService {

  api = inject(BugBoard);

  comments = signal<issueComments[]>([]);
  url = signal<string | null>(null);
  issueId = signal<number>(0);

  saveIssueAndComments(url: string, issueId: number): void {
    this.url.set(url);
    this.issueId.set(issueId);
  }

  loadComments(issueId: number) {

    this.api.getComment(issueId).subscribe(res => {
      this.comments.set(res);
    });

  } 

  loadImage(issueId: number) {
    this.api.getImage(issueId).subscribe({
      next: (res) => {
        this.url.set(res.url);
      },
      error: (err) => {
        console.warn('No image found, fallback to null');
        this.url.set(null)
      }
    });
  }

  clear(): void {
    this.url.set('');
    this.comments.set([]);
    this.issueId.set(0);
  }

}

