import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Volvemos a importar RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`, // Esto cargará el login o el dashboard según la URL
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Almacenfrontend');
}