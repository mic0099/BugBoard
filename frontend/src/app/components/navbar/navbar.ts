import { CommonModule } from '@angular/common';
import { Component, signal, HostListener, inject } from '@angular/core';


import { AuthService } from '../../services/authService/authService';
import { Router, RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/authApiService/authApiService';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  api=inject(AuthApiService); 
  router = inject(Router);
  toastr=inject(ToastrService);
  isMenuOpen = signal(false);

  constructor(
    public authService: AuthService,
  ) {}

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isMenuOpen.update(v => !v);
  }

  get initials(): string {
    const u = this.authService.user();

    if (!u) return '?';

    const name = typeof u.name === 'string' ? u.name : '';
    const surname = typeof u.surname === 'string' ? u.surname : '';

    const first = name.charAt(0);
    const second = surname.charAt(0);

    const result = (first + second).toUpperCase();

    return result || '?';
  } 

  logout(){
  this.api.logout()
  .subscribe({
    next:(res) => {
       this.toastr.success(res.message); 
       this.authService.clearAuthState(); 
       this.router.navigate(["/login"]);
    }, 
    error:(err)=>{
      let msg: string = "An error occurred, please try again";
      if(err.status===0){
      msg="Unable to connection to server. Please check your connection";
      } 
      this.toastr.error(msg);        
      this.authService.clearAuthState();
      this.router.navigate(["/login"]);
    }
})

}

  @HostListener('document:click')
  closeMenu() {
    this.isMenuOpen.set(false);
  } 


goToProject(){
  this.router.navigate(["/projectList"]);
}  

isInProjectList(): boolean {
  return this.router.url === '/projectList';
}  

}