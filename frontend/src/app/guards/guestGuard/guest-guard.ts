import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/authService/authService';

export const guestGuard: CanActivateFn = (route, state) => {

 const auth = inject(AuthService); 
 const router = inject(Router);

 if(auth.isAuthenticated()===true){
  return router.createUrlTree(["/projectList"]) 
 }

  return true;
};
