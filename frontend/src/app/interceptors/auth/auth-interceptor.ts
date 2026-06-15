import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/authService/authService';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, finalize, shareReplay } from 'rxjs';

const PUBLIC_URLS: string[] = ['/login','/refreshtoken'];

function isPublic(req: HttpRequest<unknown>) {
  return PUBLIC_URLS.some(u => req.url.includes(u)); 
}

function withAuth(req: HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }); 
}

let refreshObs: ReturnType<AuthService['refreshToken']> | null = null; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (isPublic(req)) {  
    return next(req);
  }

  const token = auth.getToken(); 
  const authedReq = token ? withAuth(req, token) : req;

  return next(authedReq).pipe( 
    catchError((err: unknown) => { 
      const httpErr = err as HttpErrorResponse; 


      if (httpErr.status !== 401) { 
        return throwError(() => err);
      }


      if (!token) {  
        auth.clearAuthState();  
        return throwError(() => err); 
      }


      if (!refreshObs) { 
        refreshObs = auth.refreshToken().pipe(  
          shareReplay(1), 
          finalize(() => { refreshObs = null; })  
        );
      }


      return refreshObs.pipe(  
        switchMap((newToken) => {  
          return next(withAuth(req, newToken));
        }),
        catchError((refreshErr: HttpErrorResponse) => {  
          if (refreshErr.status === 401 || refreshErr.status === 403) {
            auth.clearAuthState();  
            router.navigate(['/login']);  
          }
          return throwError(() => refreshErr);
        })
      );
    })
  );
}
