import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { IssueList } from './components/issue-list/issue-list';
import { AddUser } from './components/add-user/add-user';
import { authGuard } from './guards/auth/auth.gard';
import { adminGuard } from './guards/adminGuard/admin-guard';
import { IssueComments } from './components/issue-comments/issue-comments';
import { ProjectList } from './components/project-list/project-list';
import { ProjectManage } from './components/project-manage/project-manage';
import { IssueCreate } from './components/issue-create/issue-create'; 
import { guestGuard } from './guards/guestGuard/guest-guard';

    export const routes: Routes = [

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path:'login', component:Login, canActivate:[guestGuard]}, 
    { path:'projectList', component:ProjectList, canActivate:[authGuard]},
    { path:'projects/:projectId/issues', component: IssueList, canActivate:[authGuard] },
    { path:'projects/:projectId/issues/tag/:tag', component:IssueList,canActivate:[authGuard]},
    { path:'addUser', component:AddUser, canActivate:[authGuard,adminGuard] },
    { path:'comments/:id', component:IssueComments, canActivate:[authGuard]},
    { path: 'newproject', component:ProjectManage, canActivate:[authGuard,adminGuard] }, 
    { path: 'projects/:projectId/issues/new', component:IssueCreate, canActivate:[authGuard] }

    ];
