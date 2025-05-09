import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  rut = '';
  nombre = '';
  apellido1 = '';
  apellido2 = '';
  correo = '';
  contrasena = '';

  constructor(private authService: AuthService) {}

  registrar() {
    this.authService
      .register({
        rut: this.rut,
        nombre: this.nombre,
        apellido1: this.apellido1,
        apellido2: this.apellido2,
        correo: this.correo,
        contrasena: this.contrasena,
      })
      .subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          alert('Registrado correctamente');
        },
        error: (error) => {
          console.error('Error de registro:', error);
          alert('Registro fallido');
        },
      });
  }
}
