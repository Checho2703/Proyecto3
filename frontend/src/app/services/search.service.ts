// src/app/services/user-search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaz para los resultados de la búsqueda de usuarios
export interface UsuarioBusqueda {
    ID_usuario: number;
    Rut: string;
    Nombres: string;
    Apellido_Paterno: string;
    Apellido_Materno: string | null;
    Correo: string;
    Telefono: string | null;
    Estado: string;
    Fecha_nac: string | null;
    Tipo_usuario: string; // Puede ser 'Alumno', 'Docente', etc.
    Nombre_rol: string;
    Establecimiento: string;
    Comuna: string;
    Nombre_curso: string | null; // Puede ser null si el usuario no tiene un curso asociado
    Asignatura: string | null; // Puede ser null si el usuario no tiene una asignatura asociada
}

@Injectable({
    providedIn: 'root'
})
export class UserSearchService {
    private apiUrl = '/api/searchp'; // URL base de tu searchp-service

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return headers;
    }

    private handleError(error: any): Observable<never> {
        console.error('An error occurred:', error);
        let errorMessage = 'Error al procesar la solicitud. Inténtelo de nuevo.';
        if (error.error && error.error.error) {
            errorMessage = error.error.error;
        } else if (error.error && error.error.mensaje) { // Para el caso de "Usuario no encontrado"
            errorMessage = error.error.mensaje;
        }
        return throwError(() => new Error(errorMessage));
    }

    // Método para buscar usuarios
    buscarUsuarios(criteria: { comuna?: string, colegio?: string, curso?: string, asignatura?: string, rut?: string }): Observable<UsuarioBusqueda[]> {
        return this.http.post<UsuarioBusqueda[]>(`${this.apiUrl}/buscar`, criteria, { headers: this.getHeaders() })
            .pipe(
                catchError(this.handleError)
            );
    }
}