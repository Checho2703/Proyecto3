// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Asegúrate que apunta a tu CSS
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.error = '';
    this.successMessage = '';

    this.auth.login({ correo: this.email, contrasena: this.password }).subscribe({
      next: (response: any) => { // Asegúrate de tipar la respuesta si tienes una interfaz
        this.successMessage = '¡Inicio de sesión exitoso!';
        console.log('Login successful, response:', response); // Para depurar

        // --- INICIO: CAMBIOS PARA ALMACENAR EL ROL Y REDIRIGIR ---

        // Asumiendo que tu backend devuelve la información del usuario incluyendo el rol
        // en la propiedad 'usuario' y dentro de ella 'id_rol' y 'nombre' (u otros)
        const user = response.usuario; // Ajusta según la estructura de tu respuesta

        if (user && user.id_rol) {
          // Almacenar el ID del rol y/o el nombre del rol.
          // localStorage es persistente (incluso si cierras el navegador), sessionStorage es solo por sesión.
          // Para roles, localStorage suele ser útil.
          localStorage.setItem('userRole', user.id_rol); // Guarda el ID del rol
          localStorage.setItem('userName', user.nombre); // Guarda el nombre del usuario
          localStorage.setItem('userId', user.id); // Guarda el ID del usuario

          // Opcional: Si tienes el nombre del rol en la respuesta del backend
          // localStorage.setItem('userRoleName', user.nombre_rol);

          setTimeout(() => {
            this.router.navigate(['/home']); // Redirige a la ruta '/home'
          });

        } else {
          console.error('La respuesta del backend no contiene la información de usuario esperada:', response);
          this.error = 'Error de autenticación: Datos de usuario incompletos.';
        }
      },
      error: (err: any) => {
        console.error('Error de login:', err);
        this.error = err.error?.error || 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }

  // método goToRegister() para ir a registrar usuario
  // goToRegister() {
  //   this.router.navigate(['/register']);
  // }
}