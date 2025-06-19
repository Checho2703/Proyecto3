import { Component, OnInit } from '@angular/core'; // Importa OnInit
import { AuthService, Establecimiento } from '../services/auth.service'; // Importa Establecimiento
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit { // Implementa OnInit
  rut: string = '';
  nombres: string = '';
  apellido_paterno: string = '';
  apellido_materno: string = '';
  correo: string = '';
  contrasena: string = '';
  telefono: string = '';
  estado: string = 'Activo';
  fecha_nac: string = '';
  id_rol: number = 3; // Valor por defecto para Alumno
  id_establecimiento: number | null = null; // Inicialmente null, será obligatorio en HTML

  errorMessage: string = '';
  successMessage: string = '';

  establecimientos: Establecimiento[] = []; // Nueva propiedad para guardar los establecimientos

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void { // Implementa el método ngOnInit
    this.loadEstablecimientos(); // Llama a la función para cargar los establecimientos
  }

  loadEstablecimientos() {
    this.auth.getEstablecimientos().subscribe({
      next: (data) => {
        this.establecimientos = data;
        // Opcional: Si quieres pre-seleccionar el primer establecimiento o un valor por defecto
        // if (this.establecimientos.length > 0) {
        //   this.id_establecimiento = this.establecimientos[0].ID_establecimiento;
        // }
      },
      error: (err) => {
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
      id_establecimiento: this.id_establecimiento // Ya no será null si pasa la validación
    };

    this.auth.register(userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.successMessage = '¡Registro exitoso! Ahora puedes iniciar sesión.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        this.errorMessage = error.error?.error || 'Error al registrar usuario. Inténtalo de nuevo.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}