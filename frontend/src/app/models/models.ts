export interface User {
    userId?: string;
    email?: string;
    name: string;
    surname: string;
    admin?: boolean;
  }




export interface Issue {
    issueId: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'blocker';
    type: 'question' | 'bug' | 'documentation' | 'feature';
    status: 'open' | 'todo' | 'in_progress' | 'closed';
    projectId: number;
    User?: User; 
    createdAt: string;

    Image?: { url: string };   
    Project?: { name: string };
  }