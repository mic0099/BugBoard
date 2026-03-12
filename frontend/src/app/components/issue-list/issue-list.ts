import { HostListener,Component, OnInit } from '@angular/core';
import { Issue } from '../../models/models'
import { CommonModule } from '@angular/common'; 
import { BugBoard } from '../../services/bugBoardService/bug-board'
import { IssueItem } from '../issue-item/issue-item';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule,IssueItem],
  templateUrl: './issue-list.html',
  styleUrl: './issue-list.scss',
})
export class IssueList implements OnInit {

  issues: Issue[] = [];

  activeStatus: string = 'all';
  selectedPriorities: string[] = [];
  selectedTypes: string[] = [];
  sortDirection: 'asc' | 'desc' = 'desc'; 
  openedMenu: string | null = null;

  filteredIssues: any[] = [];

  readonly priorities: Issue['priority'][] = ['blocker', 'high', 'medium', 'low'];
  readonly types: Issue['type'][] = ['bug', 'feature', 'question', 'documentation'];

  constructor(private issueService: BugBoard) {}

  ngOnInit(): void {
    
    this.loadIssue();
    
  }

  loadIssue(filters?: any) {
    this.issueService.getIssues(filters).subscribe(data => {
      this.issues = data;
      this.applyFilters();
    });
  }


    
  applyFilters() {
     
    let Issues = [...this.issues];
  
      // Filtro per Stato
    if (this.activeStatus !== 'all') {
      Issues = Issues.filter(i => i.status === this.activeStatus);
    }
  
    // Filtro per Priorità 
    if (this.selectedPriorities.length > 0) {
      Issues = Issues.filter(i => this.selectedPriorities.includes(i.priority));
    }
  
    // Filtro per Tipo
    if (this.selectedTypes.length > 0) {
      Issues = Issues.filter(i => this.selectedTypes.includes(i.type));
    }
  
    // Ordinamento per Data 
    Issues.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  
    // Assegniamo il risultato alla lista visualizzata
    this.filteredIssues = Issues;
  }





  /*handleStatusChange(issueId: number, newStatus: string) {
    this.issueService.updateStatus(issueId,newStatus).subscribe(() => {
      const iss = this. issues.find(i => i.issueId === issueId);
      if (iss) iss.status = newStatus as any;
    });
  }*/




  

  // cambio stato
  setStatusFilter(status: string) {
    this.activeStatus = status;
    this.applyFilters();
  }

  
  //menu
  toggleMenu(menu: string, event: MouseEvent) {
  event.stopPropagation();
  console.log('toggleMenu chiamato, menu:', menu);
  setTimeout(() => {
    this.openedMenu = this.openedMenu === menu ? null : menu;
    console.log('openedMenu settato a:', this.openedMenu);
  }, 0);
}

@HostListener('document:click')
onDocumentClick() {
  console.log('document click, chiudo menu');
  this.openedMenu = null;
}


  togglePriority(priority: string, event: Event) {
    event.stopPropagation();
    const idx = this.selectedPriorities.indexOf(priority);
    if (idx > -1) {
      this.selectedPriorities.splice(idx, 1);
    } else {
      this.selectedPriorities.push(priority);
    }
    this.applyFilters();
  }

  toggleType(type: string, event: Event) {
    event.stopPropagation();
    const idx = this.selectedTypes.indexOf(type);
    if (idx > -1) {
      this.selectedTypes.splice(idx, 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.applyFilters();
  }






  // Cambia la direzione dell'ordinamento
  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }



  get currentSortLabel(): string {
    return this.sortDirection === 'asc' ? 'Più vecchi' : 'Più recenti';
  }

}