import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private baseUrl = '/api/list';

  private jsonHeaders = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  listarColegios(comuna: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/colegios`,
      { comuna },
      this.jsonHeaders
    ).pipe(catchError(this.handleError));
  }

  listarCursos(colegio: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/cursos`,
      { colegio },
      this.jsonHeaders
    ).pipe(catchError(this.handleError));
  }

  listarAsignaturas(colegio: string, curso: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/asignaturas`,
      { colegio, curso },
      this.jsonHeaders
    ).pipe(catchError(this.handleError));
  }

  listarArchivos(colegio: string, curso: string, asignatura: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/archivos`,
      { colegio, curso, asignatura },
      this.jsonHeaders
    ).pipe(catchError(this.handleError));
  }

  obtenerMétricas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/metrics`, {
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error del servidor:', error);
    return throwError(() => new Error('Error al comunicarse con el servidor.'));
  }
}
