import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from './services/user.service';
import { Theme } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Habit Hunter';
  currentTheme: Theme = Theme.LIGHT;
  
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.user$.subscribe(user => {
      this.currentTheme = user.settings.theme;
    });
  }
}
