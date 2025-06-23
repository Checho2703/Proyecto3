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
  userName: string | null = null;
  isAdministrator: boolean = false;
  isAlumno: boolean = false;
  isDocente: boolean = false;
  isApoderado: boolean = false;
  isFuncionario: boolean = false;

  constructor(private router: Router) { } // Inyectar Router

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole');
    this.userName = localStorage.getItem('userName');

    if (this.userRole === '1') { // Ajusta '1' al ID de rol de administrador que uses
      this.isDocente = true;
    }else {
      if(this.userRole === '2') {
        this.isAlumno = true;
      }else {
        if(this.userRole === '3') {
        this.isApoderado = true;
      }else{
        if(this.userRole === '4') {
          this.isAdministrator = true;
        }else {
          if(this.userRole === '5'){
            this.isFuncionario = true;
          }
        }
      }
    }
    }

    console.log('User Role:', this.userRole);
    console.log('Is Administrator:', this.isAdministrator);
    console.log('Is Docente:', this.isDocente);
    console.log('Is Alumno:', this.isAlumno);
    console.log('Is Apoderado:', this.isApoderado);
    console.log('Is Funcionario:', this.isFuncionario);

    //Manda a login si no hay rol (usuario no logueado)
    if (!this.userRole) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    localStorage.removeItem('userRole'); // Limpia el rol
    localStorage.removeItem('userName'); // Limpia el nombre
    localStorage.removeItem('userId');   // Limpia el ID del usuario
    // Limpia cualquier otra cosa que hayas guardado del usuario
    this.router.navigate(['/login']); // Redirige de vuelta a la página de login
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}