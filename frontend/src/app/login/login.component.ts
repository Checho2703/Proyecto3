import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  rut = '';
  contrasena = '';

  constructor(private authService: AuthService) {}

  login() {
    this.authService
      .login({
        rut: this.rut,
        contrasena: this.contrasena,
      })
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          // aquí puedes redirigir o guardar token
        },
        error: (error) => {
          console.error('Error de login:', error);
          alert('Login fallido');
        },
      });
  }
}
