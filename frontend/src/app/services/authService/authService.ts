import { Injectable,WritableSignal,computed,effect,inject,signal } from '@angular/core';
import {AuthState} from '../../interfaces/auth-state.type'
import {jwtDecode} from 'jwt-decode';
import { EMPTY, firstValueFrom, Observable } from 'rxjs';
import {HttpClient} from '@angular/common/http'; 
import {map,tap} from 'rxjs/operators'; 


@Injectable({
  providedIn: 'root'
})
export class AuthService {
    authState: WritableSignal<AuthState> = signal<AuthState>({ 
        user: null, 
        token: this.getToken(), 
        isAuthenticated: this.userAuthenticated(), 
    })

   
user = computed( () => this.authState().user ); 
token = computed(()=>this.authState().token);
isAuthenticated = computed(()=>this.authState().isAuthenticated); 
isAdmin = computed(() =>
   this.authState().user?.role === 'ADMIN'
); 

private readonly LS_TOKEN_KEY='accessToken'; 

constructor(private http: HttpClient){
     effect(() =>{ 
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

getToken(){ 
      return localStorage.getItem(this.LS_TOKEN_KEY) || sessionStorage.getItem(this.LS_TOKEN_KEY);
} 

getRememberMe(){ 
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

verifyToken(token:string|null){ 
    
     if(token === null){return false}  
     
     try{
       const dec:any=jwtDecode(token);  

        if(!dec.exp){return true;} 

        const exp = dec.exp; 
        const now = Math.floor(Date.now()/1000); 
          
        return now <= exp;  

     }catch(error){ 
       return false;  
     }
    
}

userAuthenticated(){  
    return this.verifyToken(this.getToken()); 
}

updateToken(token:string,throwOnError=false,loadProfile=true){
    try{
    const rememberMe = localStorage.getItem("ricordami");   
    const decToken :any = jwtDecode(token); 
    const userId = decToken.userId;  
    if(!userId){ 
      if(throwOnError){
         throw new Error ("Token Malformato"); 
      }
         this.clearAuthState(); 
         return; 
    }

      if(rememberMe==='true'){ 
      localStorage.setItem(this.LS_TOKEN_KEY,token); 
      }else{
      sessionStorage.setItem(this.LS_TOKEN_KEY,token);
      }   

     let typeRole: 'USER'|'ADMIN' = 'USER'
     if(decToken.admin===true){
     typeRole = 'ADMIN'
     } 
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
       this.clearAuthState(); 
   }
}

refreshToken(): Observable<string>{ 
   return this.http.get<{accessToken: string}>( 
         'http://localhost:3000/refreshtoken',
         {
            withCredentials:true,  
            responseType:'json'
         }
   ).pipe(
      tap(res=>{ 
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


bootstrapFromStorage():Promise<void>{ 
    return new Promise(async (resolve)=>{
  
        const token = this.getToken(); 
        const rememberMe=localStorage.getItem('ricordami')  

        if(!token||rememberMe==='false'){ 
          this.clearAuthState();  
          return resolve(); 
        }

        if(this.verifyToken(token)){ 
          this.updateToken(token,false,false); 
          try{
            await firstValueFrom(this.loadUser()); 
          }catch(err){
            this.clearAuthState(); 
          }
          return resolve();   
        }

        this.refreshToken().subscribe({  
         next: ()=>{
            resolve(); 
         }, 
         error:()=>{
             this.clearAuthState(); 
             resolve(); 
         } 
        })

    }); 

}

}
