// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/authService/authService';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, finalize, shareReplay } from 'rxjs';

const PUBLIC_URLS: string[] = ['/login','/refreshtoken'];

function isPublic(req: HttpRequest<unknown>) {
  return PUBLIC_URLS.some(u => req.url.includes(u)); //ritorna true se l'url della richiesta contiene gli url specificati 
}

function withAuth(req: HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }); //creo una nuova richiesta con header specificato
}

let refreshObs: ReturnType<AuthService['refreshToken']> | null = null; //serve per evitare chiamate multiple È una variabile che memorizza la chiamata di refresh token “attiva”, per evitare di rifarla più volte in contemporanea.

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (isPublic(req)) { //verifico se l'url attuale fa riferimento ad una rotta publica 
    return next(req);
  }

  const token = auth.getToken(); //recpero access token
  const authedReq = token ? withAuth(req, token) : req;

  return next(authedReq).pipe( //invio la richiesta 
    catchError((err: unknown) => { //se viene generato errore 
      const httpErr = err as HttpErrorResponse; //salvo errore in una variabile 


      if (httpErr.status !== 401) { //verifico a quale errore fa riferimento 
        return throwError(() => err);
      }


      if (!token) { //verifico se token è null 
        auth.clearAuthState(); //se null pulisco lo stato 
        return throwError(() => err); //lancio errore 
      }


      if (!refreshObs) { //verifico se è consistente 
        refreshObs = auth.refreshToken().pipe( //sfrutto il metodo authservice per richiesta al back alla rotta di refresh 
          shareReplay(1), //evito chiamate duplicate, cosi tutte le richieste utilizzano il medesimo observables 
          finalize(() => { refreshObs = null; }) //metto refresh a null in modo tale che puo essere riuytilizzato 
        );
      }


      return refreshObs.pipe( //ritento la richiesta alla rotta che aveva generato errore 
        switchMap((newToken) => { //attende il nuovo token e invi la richiesta con il nuovo header 
          return next(withAuth(req, newToken));
        }),
        catchError((refreshErr: HttpErrorResponse) => { //se la richiesta fallisce 
          if (refreshErr.status === 401 || refreshErr.status === 403) {
            auth.clearAuthState(); //pulisco lo stato 
            router.navigate(['/login']); //reinderizzo al login 
          }
          return throwError(() => refreshErr);
        })
      );
    })
  );
}
