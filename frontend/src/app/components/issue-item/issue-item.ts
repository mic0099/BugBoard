import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter} from '@angular/core';
import { Issue } from '../../models/models'

@Component({
  selector: 'app-issue-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-item.html',
  styleUrl: './issue-item.scss',
})
export class IssueItem {

@Input() issue!: Issue;


}
