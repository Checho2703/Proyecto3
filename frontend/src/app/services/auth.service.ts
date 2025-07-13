import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Establecimiento {
  ID_establecimiento: number;
  Nombre: string;
  // Puedes añadir más propiedades si las necesitas, como Tipo_establecimiento, etc.
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://3.142.149.94:3000'; // Asegúrate de que esta URL sea correcta

  constructor(private http: HttpClient) { }

  register(data: {
    rut: string; 
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string | null; 
    correo: string;
    contrasena: string;
    telefono?: string | null; 
    estado?: string; 
    fecha_nac?: string | null; 
    id_rol?: number | null; 
    id_establecimiento?: number | null; 
  }): Observable<any> {
    const payload = {
      rut: data.rut,
      nombres: data.nombres,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno,
      correo: data.correo,
      contrasena: data.contrasena,
      telefono: data.telefono,
      estado: data.estado,
      fecha_nac: data.fecha_nac,
      id_rol: data.id_rol,
      id_establecimiento: data.id_establecimiento,
    };

    return this.http.post(`${this.API_URL}/register`, payload);
  }

  login(credentials: { correo: string; contrasena: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  getEstablecimientos(): Observable<Establecimiento[]> {
    return this.http.get<Establecimiento[]>(`${this.API_URL}/establecimientos`);
  }
}