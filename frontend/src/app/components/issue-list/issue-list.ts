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

  // Variabili di Stato dei Filtri
  activeStatus: string = 'all';
  selectedPriorities: string[] = [];
  selectedTypes: string[] = [];
  sortDirection: 'asc' | 'desc' = 'desc'; 
  openedMenu: string | null = null;

  // La lista che l'HTML cicla nel *ngFor
  filteredIssues: any[] = [];


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
  
    // Ordinamento per Data (createdAt)
    Issues.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  
    // Assegniamo il risultato alla lista visualizzata
    this.filteredIssues = Issues;
  }





  handleStatusChange(issueId: number, newStatus: string) {
    this.issueService.updateStatus(issueId,newStatus).subscribe(() => {
      const iss = this. issues.find(i => i.issueId === issueId);
      if (iss) iss.status = newStatus as any;
    });
  }




  

  // cambio stato
  setStatusFilter(status: string) {
    this.activeStatus = status;
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