import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/authService/authService';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  const toastr: ToastrService = inject(ToastrService);

  console.log('eseguito');

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

