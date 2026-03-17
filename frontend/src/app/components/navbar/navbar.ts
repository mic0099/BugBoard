import { CommonModule } from '@angular/common';
import { Component, signal, HostListener } from '@angular/core';


import { AuthService } from '../../services/authService/authService';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

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
    return (u.name[0] + u.surname[0]).toUpperCase();
  }

  @HostListener('document:click')
  closeMenu() {
    this.isMenuOpen.set(false);
  }

}
