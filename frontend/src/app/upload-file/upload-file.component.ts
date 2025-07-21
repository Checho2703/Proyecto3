import { Component } from '@angular/core';
import { FileUploadService } from '../services/upload-file.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']  
})
export class UploadFileComponent {
  comunas: string[] = [
    'Santiago',
    'Providencia',
    'Ñuñoa',
    'Las Condes',
    'Cerrillos',
    'Cerro Navia',
    'Conchalí',
    'El Bosque',
    'Estación Central',
    'Huechuraba',
    'Independencia',
    'La Cisterna',
    'La Florida',
    'La Granja',
    'La Pintana',
    'La Reina',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'Pedro Aguirre Cerda',
    'Peñalolén',
    'Pudahuel',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Joaquín',
    'San Miguel',
    'San Ramón',
    'Vitacura'
  ];
  colegiosOpciones: string[] = ['Colegio San Juan', 'Liceo Bicentenario', 'Escuela Basica El Sol', 'Instituto Tecnologico'];
  cursosOpciones: string[] = [
    '1ro Básico',
    '2do Básico',
    '3ro Básico',
    '4to Básico',
    '5to Básico',
    '6to Básico',
    '7mo Básico',
    '8vo Básico',
    '1ro Medio',
    '2do Medio',
    '3ro Medio',
    '4to Medio'
  ];
  asignaturasOpciones: string[] = ['Matemáticas', 'Lenguaje', 'Historia', 'Ciencias Naturales', 'Educación Física'];

  selectedComuna: string | null = null;
  selectedColegio: string | null = null;
  selectedCurso: string | null = null;
  selectedAsignatura: string | null = null;
  tipo: string = '';
  descripcion: string = '';
  archivoSeleccionado: File | null = null;

  subiendoArchivo = false;
  errorMessage = '';
  noResultsMessage = '';

  constructor(private fileUploadService: FileUploadService) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  clearFilters() {
    this.selectedComuna = null;
    this.selectedColegio = null;
    this.selectedCurso = null;
    this.selectedAsignatura = null;
    this.tipo = '';
    this.descripcion = '';
    this.archivoSeleccionado = null;
    this.errorMessage = '';
    this.noResultsMessage = '';
  }

  uploadF() {
    this.errorMessage = '';
    this.noResultsMessage = '';

    if (!this.archivoSeleccionado) {
      this.errorMessage = 'Debes seleccionar un archivo.';
      return;
    }

    this.subiendoArchivo = true;

    this.fileUploadService.subirArchivo(
      this.archivoSeleccionado,
      this.selectedComuna ?? '',
      this.selectedColegio ?? '',
      this.selectedCurso ?? '',
      this.selectedAsignatura ?? '',
      this.tipo,
      this.descripcion
    ).subscribe({
      next: () => {
        this.subiendoArchivo = false;
        this.noResultsMessage = 'Archivo subido exitosamente.';
        this.clearFilters();
      },
      error: (err: any) => {
        this.subiendoArchivo = false;
        this.errorMessage = err.message || 'Error al subir el archivo.';
      }
    });
  }
}
