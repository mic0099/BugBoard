import { HostListener,Component, OnInit, inject } from '@angular/core';
import { Issue } from '../../interfaces/issue'
import { CommonModule } from '@angular/common'; 
import { BugBoard } from '../../services/bugBoardService/bug-board'
import { IssueItem } from '../issue-item/issue-item';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule,IssueItem,FormsModule],
  templateUrl: './issue-list.html',
  styleUrl: './issue-list.scss',
})
export class IssueList implements OnInit {

    issues: Issue[] = []; 
    router = inject(Router);

    projectId!: number;

    activeStatus: string = 'all';
    selectedPriorities: string[] = [];
    selectedTypes: string[] = [];
    sortDirection: 'asc' | 'desc' = 'desc'; 
    openedMenu: string | null = null; 
    currentTag: string | null = null; 
    searchTag: string = '';  
    toastr = inject(ToastrService)

    filteredIssues: any[] = [];

    readonly priorities: Issue['priority'][] = ['blocker', 'high', 'medium', 'low'];
    readonly types: Issue['type'][] = ['bug', 'feature', 'question', 'documentation'];

    constructor(private issueService: BugBoard, private route: ActivatedRoute) {}


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('projectId');
      const tag = params.get('tag');

      this.projectId = Number(id);

      if (tag) {
        this.currentTag = tag;

        this.issues = [];           
        this.filteredIssues = [];   

        this.issueService.getIssuesByTag(this.projectId, tag)
          .subscribe(data => {
            this.issues = data || [];  
            this.applyFilters(); 
          });

      } else {
        this.currentTag = null;

        this.loadIssue({ projectId: this.projectId });
      }

    });
  }

    loadIssue(filters?: any) {
      this.issueService.getIssues(filters).subscribe(data => {
        this.issues = data;
        this.applyFilters();
      });
    }


      
    applyFilters() {
      
      let Issues = [...this.issues];
    
      
      if (this.activeStatus !== 'all') {
        Issues = Issues.filter(i => i.status === this.activeStatus);
      }
    

      if (this.selectedPriorities.length > 0) {
        Issues = Issues.filter(i => this.selectedPriorities.includes(i.priority));
      }
    
    
      if (this.selectedTypes.length > 0) {
        Issues = Issues.filter(i => this.selectedTypes.includes(i.type));
      }
    
      
      Issues.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    
  
      this.filteredIssues = Issues;
    }


    

  
    setStatusFilter(status: string) {
      this.activeStatus = status;
      this.applyFilters();
    }

    

    toggleMenu(menu: string, event: MouseEvent) {
    event.stopPropagation();
    setTimeout(() => {
      this.openedMenu = this.openedMenu === menu ? null : menu;
    }, 0);
  }

  @HostListener('document:click')
  onDocumentClick() {
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



    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.applyFilters();
    }



    get currentSortLabel(): string {
      return this.sortDirection === 'asc' ? 'Least Recent' : 'Most Recent';
    }

    addIssue(){
      this.router.navigate([`/projects/${this.projectId}/issues/new`]); 
    }

  onTagSearch() {
    const tag = this.searchTag.trim().toLowerCase();

    if (!tag) return;

    if (tag.length < 2) {
      this.toastr.error("Tag is too short");
      return;
    }

    if (tag.length > 20) {
      this.toastr.error("Tag is too long");
      return;
    }

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/projects', this.projectId, 'issues', 'tag', tag]);
    });

    this.searchTag = '';
  }
}