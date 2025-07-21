import { Component, OnInit } from '@angular/core';
import { UserSearchService, UsuarioBusqueda } from '../services/search.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {

  // Opciones para los selectores (hardcodeadas, ya que searchp-service no los provee)
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


  usuariosEncontrados: UsuarioBusqueda[] = [];

  // Modelos para los filtros
  rutBusqueda: string = '';
  selectedComuna: string | null = null;
  selectedColegio: string | null = null;
  selectedCurso: string | null = null;
  selectedAsignatura: string | null = null;

  loadingSearch: boolean = false;
  errorMessage: string | null = null;
  noResultsMessage: string | null = null;

  constructor(private userSearchService: UserSearchService) { }

  ngOnInit(): void {}

  searchUsers(): void {
    this.errorMessage = null;
    this.noResultsMessage = null;
    this.usuariosEncontrados = []; 

    // Construir los criterios de búsqueda dinámicamente
    const criteria: { comuna?: string, colegio?: string, curso?: string, asignatura?: string, rut?: string } = {};

    if (this.rutBusqueda.trim()) { 
      criteria.rut = this.rutBusqueda.trim();
    }
    if (this.selectedComuna) {
      criteria.comuna = this.selectedComuna;
    }
    if (this.selectedColegio) {
      criteria.colegio = this.selectedColegio;
    }
    if (this.selectedCurso) {
      criteria.curso = this.selectedCurso;
    }
    if (this.selectedAsignatura) {
      criteria.asignatura = this.selectedAsignatura;
    }

    // Verificar si al menos un criterio está presente
    if (Object.keys(criteria).length === 0) {
      this.errorMessage = 'Debe proporcionar al menos un criterio de búsqueda.';
      return;
    }

    this.loadingSearch = true;
    this.userSearchService.buscarUsuarios(criteria).subscribe({
      next: (data: UsuarioBusqueda[]) => {
        this.usuariosEncontrados = data;
        this.loadingSearch = false;
        if (this.usuariosEncontrados.length === 0) {
          this.noResultsMessage = 'No se encontraron usuarios con los criterios seleccionados.';
        }
      },
      error: (err: any) => {
        console.error('Error al buscar usuarios:', err);
        this.errorMessage = err.message || 'Error al buscar usuarios. Inténtelo de nuevo.';
        this.loadingSearch = false;
        if (err.message.includes("Usuario no encontrado")) {
            this.noResultsMessage = err.message;
            this.errorMessage = null;
        }
      }
    });
  }

  // Opcional: Función para limpiar todos los filtros
  clearFilters(): void {
    this.rutBusqueda = '';
    this.selectedComuna = null;
    this.selectedColegio = null;
    this.selectedCurso = null;
    this.selectedAsignatura = null;
    this.usuariosEncontrados = [];
    this.errorMessage = null;
    this.noResultsMessage = null;
  }
}