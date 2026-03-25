import { User } from "./user";

export interface Project {
    projectId: number;
    name: string;
    createdAt: string;
    issuesCount?: number; 
    Users?: User[];
  }