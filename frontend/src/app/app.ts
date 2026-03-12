import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { Footer } from "./components/footer/footer";
import { CommonModule } from '@angular/common';

import { AuthService } from './services/authService/authService';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public auth: AuthService){}
}
