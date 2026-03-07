import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { IssueList } from './components/issue-list/issue-list';

export const routes: Routes = [

{ path: '', redirectTo: 'login', pathMatch: 'full' },
{ path:'login', component:Login}, 
{ path: 'issueList', component:IssueList}

];

