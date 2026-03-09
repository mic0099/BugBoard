import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { IssueList } from './components/issue-list/issue-list';
import { AddUser } from './components/add-user/add-user';
import { authGuard } from './guards/auth/auth.gard';
import { adminGuard } from './guards/adminGuard/admin-guard';

export const routes: Routes = [

{ path: '', redirectTo: 'login', pathMatch: 'full' },
{ path:'login', component:Login}, 
{ path: 'issueList', component:IssueList}, 
{path:'addUser', component:AddUser, canActivate:[authGuard,adminGuard] },

];

