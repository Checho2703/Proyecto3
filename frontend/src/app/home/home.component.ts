// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userRole: string | null = null;
  // userName ya no es necesario aquí si solo se usa en la navbar global
  // userName: string | null = null; // ELIMINAR ESTA LÍNEA

  isAdministrator: boolean = false;
  isAlumno: boolean = false;
  isDocente: boolean = false;
  isApoderado: boolean = false;
  isFuncionario: boolean = false;

  constructor(private router: Router) { } // Inyectar Router

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole');
    // this.userName = localStorage.getItem('userName'); // ELIMINAR ESTA LÍNEA

    // Lógica de asignación de roles basada en ID (ajustada para ser más limpia)
    switch (this.userRole) {
      case '1': // ID para Docente, según tu código
        this.isDocente = true;
        break;
      case '2': // ID para Alumno, según tu código
        this.isAlumno = true;
        break;
      case '3': // ID para Apoderado, según tu código
        this.isApoderado = true;
        break;
      case '4': // ID para Administrador, según tu código
        this.isAdministrator = true;
        break;
      case '5': // ID para Funcionario, según tu código
        this.isFuncionario = true;
        break;
      default:
        // Si el rol no coincide con ninguno, o es nulo
        this.router.navigate(['/login']); // Redirige si el rol no es válido o no está presente
        break;
    }

    console.log('User Role:', this.userRole);
    console.log('Is Administrator:', this.isAdministrator);
    console.log('Is Docente:', this.isDocente);
    console.log('Is Alumno:', this.isAlumno);
    console.log('Is Apoderado:', this.isApoderado);
    console.log('Is Funcionario:', this.isFuncionario);

    // La redirección a login si no hay rol ya está cubierta en el switch-case default
    // if (!this.userRole) {
    //   this.router.navigate(['/login']);
    // }
  }

  // ELIMINAR LA FUNCIÓN logout() DE AQUÍ, YA QUE AHORA ESTARÁ EN app.component.ts
  // logout(): void {
  //   localStorage.removeItem('userRole');
  //   localStorage.removeItem('userName');
  //   localStorage.removeItem('userId');
  //   this.router.navigate(['/login']);
  // }

  goToRegister(): void { // Cambiado a void para consistencia
    this.router.navigate(['/register']);
  }
}