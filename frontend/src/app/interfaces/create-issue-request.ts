export interface CreateIssueRequest {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'blocker';
    type: 'question' | 'bug' | 'documentation' | 'feature';
    status: 'open' | 'todo' | 'in_progress' | 'closed';
    projectId: number; 
}
