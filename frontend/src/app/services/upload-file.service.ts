import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private apiUrl = '/api/upload';

  constructor(private http: HttpClient) {}

  subirArchivo(
    archivo: File,
    comuna: string,
    colegio: string,
    curso: string,
    asignatura: string,
    tipo: string,
    descripcion: string
  ): Observable<any> {
    const formData = new FormData();

    formData.append('archivo', archivo);
    formData.append('comuna', comuna);
    formData.append('colegio', colegio);
    formData.append('curso', curso);
    formData.append('asignatura', asignatura);
    formData.append('tipo', tipo);
    formData.append('descripcion', descripcion);

    return this.http.post<any>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la subida:', error);
    return throwError(() => new Error('Ocurrió un error al subir el archivo.'));
  }
}
