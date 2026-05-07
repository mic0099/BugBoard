import { Injectable,WritableSignal,computed,effect,inject,signal } from '@angular/core';
import {AuthState} from '../../interfaces/auth-state.type'
import {jwtDecode} from 'jwt-decode';
import { EMPTY, firstValueFrom, Observable } from 'rxjs';
import {HttpClient} from '@angular/common/http'; 
//import {environment} from '../../../environments/environment';
import {map,tap} from 'rxjs/operators'; 
import { AuthApiService } from '../authApiService/authApiService';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    authState: WritableSignal<AuthState> = signal<AuthState>({ //creazione singals writable authstate 
        user: null, 
        token: this.getToken(), 
        isAuthenticated: this.userAuthenticated(), 
    })

//definisco signals derivati a partire dal siglas authstate, si aggionranro al cambiamento di authstate     
user = computed( () => this.authState().user ); 
token = computed(()=>this.authState().token);
isAuthenticated = computed(()=>this.authState().isAuthenticated); 
isAdmin = computed(() =>
   this.authState().user?.role === 'ADMIN'
); 

private readonly LS_TOKEN_KEY='accessToken'; 

constructor(private http: HttpClient){
     effect(() =>{ //l'effect reagisce al cambiamento del signals e ogni volta che authstate cambia esegue il codice al suo interno
        const token = this.authState().token; 
        const rememberMe = this.getRememberMe();
    
        if(token !== null){
          if(rememberMe==='true'){
            localStorage.setItem(this.LS_TOKEN_KEY,token)
          }else{
            sessionStorage.setItem(this.LS_TOKEN_KEY,token);
          }
        }else{
            localStorage.removeItem(this.LS_TOKEN_KEY); 
        }
     }); 
}

getToken(){ //prende token da local o session storage 
      return localStorage.getItem(this.LS_TOKEN_KEY) || sessionStorage.getItem(this.LS_TOKEN_KEY);
} 

getRememberMe(){ //prende val remeber da local o session 
   return localStorage.getItem('ricordami')||sessionStorage.getItem('ricordami');  
}

loadUser() {
  const token = this.authState().token;
  if(!token){return EMPTY};
  return this.http.get<{ name: string; surname: string }>(
    'http://localhost:3000/me'
  ).pipe(
    tap(userData => {
      this.authState.update(state => {
        // se per qualche motivo non c'è user nello state, lo ricavo dal token
        const decoded: any = jwtDecode(token);
        const userId: string | undefined = decoded?.userId;
        const role: 'USER' | 'ADMIN' = decoded?.admin === true ? 'ADMIN' : 'USER';

        return {
          ...state,
          user: {
            id: state.user?.id ?? userId ?? '',
            role: state.user?.role ?? role,
            name: userData.name,
            surname: userData.surname,
          }
        };
      });
    })
  );
}

verifyToken(token:string|null){ //verifica la validità del token 
    
     if(token === null){return false}  
     
     try{
       const dec:any=jwtDecode(token);  //decodifico il token 

        if(!dec.exp){return true;} //se exp del token è null return 

        const exp = dec.exp; //salvo data token 
        const now = Math.floor(Date.now()/1000); //salvo data corrente 
          
        return now <= exp; //ritorna true se token è valido false altrimenti 

     }catch(error){ 
       return false;  
     }
    
}

userAuthenticated(){ //verifica se l'utente è autenticato  
    return this.verifyToken(this.getToken()); 
}

updateToken(token:string,throwOnError=false,loadProfile=true){
    try{
    const rememberMe = localStorage.getItem("ricordami");   
    const decToken :any = jwtDecode(token); //decodifico token 
    const userId = decToken.userId;  //salvo username preso dal token  
    if(!userId){ //verifico se username è valido 
      if(throwOnError){
         throw new Error ("Token Malformato"); 
      }
         this.clearAuthState(); //se non è valido cancello lo stato di autenticazione 
         return; //termino il metodo 
    }

      if(rememberMe==='true'){ //verifico remember me 
      localStorage.setItem(this.LS_TOKEN_KEY,token); 
      }else{
      sessionStorage.setItem(this.LS_TOKEN_KEY,token);
      }   

     let typeRole: 'USER'|'ADMIN' = 'USER'
     if(decToken.admin===true){
     typeRole = 'ADMIN'
     } 
console.log("TOKEN DECODED:", decToken)
    this.authState.update(state => ({
         ...state, 
         token:token, 
         isAuthenticated:this.verifyToken(token), 
         user:{
          id:userId, 
          role:typeRole, 
          name:state.user?.name ?? '', 
          surname:state.user?.surname ?? '', 
         }
    }));  


    if(loadProfile){
    this.loadUser().subscribe({
      error: () => this.clearAuthState()
    }); 
  }

   }catch(err){
       if(throwOnError){
          throw err
       }
       this.clearAuthState(); //in caso di errore cancello statto autenticazione 
   }
}

refreshToken(): Observable<string>{ 
   return this.http.get<{accessToken: string}>( //richiesta al back per rotta di refresh token 
         'http://localhost:3000/refreshtoken',
         {
            withCredentials:true, //per passare il token come cookie 
            responseType:'json'
         }
   ).pipe(
      tap(res=>{ //se tutto va a buon fine carico il nuovo access token
        this.updateToken(res.accessToken);             
      }),
      map(res=>res.accessToken)
   );
}

clearAuthState(){
   localStorage.removeItem(this.LS_TOKEN_KEY); 
   localStorage.removeItem('ricordami'); 
   sessionStorage.removeItem(this.LS_TOKEN_KEY); 
   sessionStorage.removeItem('ricordami');  
   
   this.authState.set({
       user:null, 
       token:null, 
       isAuthenticated:false,
   });
}


bootstrapFromStorage():Promise<void>{ //ripristina lo stato di autenticazione (funzione che viene eseguita appena si avvia l'applicazione)
    return new Promise(async (resolve)=>{
  
        const token = this.getToken(); //recupero il token 
        const rememberMe=localStorage.getItem('ricordami')  //recupero remember me 

        if(!token||rememberMe==='false'){ //verifico che token è null oppure remember me false 
          this.clearAuthState(); //ripristino lo stato 
          return resolve(); //risolvo la promis 
        }

        if(this.verifyToken(token)){ //verifico la validità del token 
          this.updateToken(token,false,false);//se valido aggiorno lo stato 
          try{
            await firstValueFrom(this.loadUser()); 
            console.log("BOOTSTRAP → PROFILE LOADED");
          }catch(err){
            this.clearAuthState(); 
          }
          return resolve();  //risolvo la promis 
        }

        this.refreshToken().subscribe({ //se token non vaido tento refresh 
         next: ()=>{
            resolve(); 
         }, 
         error:()=>{
             this.clearAuthState(); //in caso di errore rimuovo lo stato 
             resolve(); 
         } 
        })

    }); 

}

}
