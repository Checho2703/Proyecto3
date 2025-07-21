import { Component, OnInit } from '@angular/core';
import { AuthService, Establecimiento } from '../services/auth.service'; // Importa Establecimiento
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  rut: string = '';
  nombres: string = '';
  apellido_paterno: string = '';
  apellido_materno: string = '';
  correo: string = '';
  contrasena: string = '';
  telefono: string = '';
  estado: string = 'Activo';
  fecha_nac: string = '';
  id_rol: number = 2; // Valor por defecto para Alumno
  id_establecimiento: number | null = null; // Inicialmente null, será obligatorio en HTML

  errorMessage: string = '';
  successMessage: string = '';

  establecimientos: Establecimiento[] = []; // Nueva propiedad para guardar los establecimientos

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadEstablecimientos(); // Llama a la función para cargar los establecimientos
  }

  loadEstablecimientos() {
    this.auth.getEstablecimientos().subscribe({
      next: (data: Establecimiento[]) => {
        this.establecimientos = data;
        // Opcional: Si quieres pre-seleccionar el primer establecimiento o un valor por defecto
        // if (this.establecimientos.length > 0) {
        //   this.id_establecimiento = this.establecimientos[0].ID_establecimiento;
        // }
      },
      error: (err: any) => {
        console.error('Error al cargar establecimientos:', err);
        this.errorMessage = 'No se pudieron cargar los establecimientos.';
      }
    });
  }

  onRegisterSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validación extra en el frontend para id_establecimiento
    if (this.id_establecimiento === null || this.id_establecimiento === undefined) {
      this.errorMessage = 'Por favor, selecciona un establecimiento.';
      return; // Detiene la ejecución si no hay establecimiento seleccionado
    }

    const userData = {
      rut: this.rut,
      nombres: this.nombres,
      apellido_paterno: this.apellido_paterno,
      apellido_materno: this.apellido_materno === '' ? null : this.apellido_materno,
      correo: this.correo,
      contrasena: this.contrasena,
      telefono: this.telefono === '' ? null : this.telefono,
      estado: this.estado,
      fecha_nac: this.fecha_nac === '' ? null : this.fecha_nac,
      id_rol: this.id_rol,
      id_establecimiento: this.id_establecimiento
    };

    this.auth.register(userData).subscribe({
      next: (response: any) => {
        console.log('Registro exitoso:', response);
        setTimeout(() => {
          this.successMessage = '¡Registro exitoso!'; // Mensaje de éxito
          this.errorMessage = ''; // Limpiar cualquier mensaje de error anterior
        }, 2000); // Mostrar mensaje de éxito por 2 segundos
        this.clearForm(); // Limpiar el formulario
      },
      error: (error: any) => {
        console.error('Error al registrar usuario:', error);
        setTimeout(() => {
          this.successMessage = ''; // Limpiar cualquier mensaje de éxito anterior
          this.errorMessage = error.error?.error || 'Error al registrar usuario. Inténtalo de nuevo.';
        }, 2000); // Mostrar mensaje de error por 2 segundos
      }
    });
  }

  // Agregamos la función clearForm() para resetear los campos
  clearForm(): void {
    this.rut = '';
    this.nombres = '';
    this.apellido_paterno = '';
    this.apellido_materno = '';
    this.correo = '';
    this.contrasena = '';
    this.telefono = '';
    this.fecha_nac = '';
    this.id_rol = 2; // Vuelve a establecer el valor por defecto si lo deseas
    this.id_establecimiento = null; // Vuelve a establecer a null para el placeholder
  }

  // Mantener goToLogin() si tienes un botón para ello en tu HTML
  goToHome(): void {
    this.router.navigate(['/home']);
  }
}