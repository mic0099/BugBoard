import { CanActivateFn, Router } from '@angular/router'; 
import { AuthService } from '../../services/authService/authService';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = (route, state) => {

const auth = inject(AuthService);
const router: Router = inject(Router);
const toastr = inject(ToastrService);

  if(!auth.isAdmin()){
     toastr.error("Access denied. Administrator privileges required.");
     router.navigate(['/issueList']);
     return false;
  }

  return true;
};
