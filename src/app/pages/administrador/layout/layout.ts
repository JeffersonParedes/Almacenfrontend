import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-administrador-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class AdministradorLayoutComponent implements OnInit {
  username: string = 'Super Administrador';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const payload = this.authService.currentUserValue;
    if (payload) {
      this.username = payload.sub;
    }
  }

  getInitials(): string {
    return this.username.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
