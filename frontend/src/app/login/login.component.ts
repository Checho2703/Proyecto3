import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; // Ya lo tienes

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) {} // Router ya está inyectado

  login() {
    this.error = '';
    this.successMessage = '';

    this.auth.login({ correo: this.email, contrasena: this.password }).subscribe({
      next: () => {
        this.successMessage = '¡Inicio de sesión exitoso!';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error de login:', err);
        this.error = err.error?.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
      }
    });
  }

  // --> AÑADE ESTE NUEVO MÉTODO PARA NAVEGAR AL REGISTRO
  goToRegister() {
    this.router.navigate(['/register']); // Navega a la ruta '/register' que definiste
  }
}