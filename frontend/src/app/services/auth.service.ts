import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Cambia esto si usas otro puerto o dominio

  constructor(private http: HttpClient) {}

  login(data: { rut: string; contrasena: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: {
    rut: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    correo: string;
    contrasena: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}
