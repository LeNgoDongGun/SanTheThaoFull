import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from './components/footer/footer';
import { ChatbotComponent } from './components/chatbot/chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FormsModule,
    FooterComponent,
    ChatbotComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <app-chatbot></app-chatbot>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
})
export class App { }