import { ApplicationConfig,inject,provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr'; 
import {authInterceptor} from './interceptors/auth/auth-interceptor'; 

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthService } from './services/authService/authService';



export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideToastr({
       positionClass: 'toast-top-right', 
       timeOut: 3000, 
       extendedTimeOut: 1500, 
       closeButton: true, 
       tapToDismiss:false, 
       iconClasses:{
         error:'', 
         info:'', 
         success:'', 
         warning:'',
       },
       progressBar: true, 
       progressAnimation: 'increasing', 
       preventDuplicates: true, 
       newestOnTop: true, 
       enableHtml: false, 
    }),
    provideHttpClient(
     withInterceptors([authInterceptor]),
      withFetch()
    ),
    provideRouter(routes), 
    provideAppInitializer(()=>{
         const auth = inject(AuthService); 
         return auth.bootstrapFromStorage(); //metodo che viene eseguito all'avvio dell'app
    }),
  ]
};
