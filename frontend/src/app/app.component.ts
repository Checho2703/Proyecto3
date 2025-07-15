// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Importa NavigationEnd

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  userName: string | null = null;
  showNavAndFooter: boolean = false; // Variable para controlar la visibilidad

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Suscribirse a los eventos del router
    this.router.events.subscribe(event => {
      // Queremos reaccionar cuando la navegación ha terminado (NavigationEnd)
      if (event instanceof NavigationEnd) {
        // Verifica si la URL actual es la de login o registro
        // Puedes agregar más rutas aquí si no quieres que tengan navbar/footer
        const currentUrl = event.urlAfterRedirects;
        if (currentUrl === '/login') {
          this.showNavAndFooter = false; // Ocultar navbar y footer
        } else {
          this.showNavAndFooter = true; // Mostrar navbar y footer
        }

        // Recuperar el nombre de usuario para la navbar
        this.userName = localStorage.getItem('userName');
      }
    });

    // También para la carga inicial de la página
    // this.userName = localStorage.getItem('userName'); // Ya se hará con el primer NavigationEnd
  }

  logout(): void {
    console.log('Cerrando sesión desde el componente principal...');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']); // Redirige al login
  }
}