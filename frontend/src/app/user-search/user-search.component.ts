import { Component, OnInit } from '@angular/core';
import { UserSearchService, UsuarioBusqueda } from '../services/user-search.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {

  // Opciones para los selectores (hardcodeadas, ya que searchp-service no los provee)
  comunas: string[] = ['Santiago', 'Providencia', 'Ñuñoa', 'Las Condes', 'Chillán', 'Valparaíso', 'Concepción'];
  // Para Colegio, Curso, Asignatura:
  // Podrías tener listas más extensas o categorías si tuvieras los IDs o un mapeo.
  // Por ahora, para simplificar y dado que el servicio espera el nombre, usamos nombres.
  colegiosOpciones: string[] = ['Colegio A', 'Colegio B', 'Liceo C', 'Instituto D'];
  cursosOpciones: string[] = ['1ro Básico', '5to Básico', '8vo Básico', '1ro Medio', '4to Medio'];
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

  ngOnInit(): void {
    // Al iniciar, si quieres que se muestren todos los usuarios, podrías llamar a searchUsers() sin criterios
    // this.searchUsers(); // Descomentar si quieres una carga inicial de todos los usuarios
  }

  searchUsers(): void {
    this.errorMessage = null;
    this.noResultsMessage = null;
    this.usuariosEncontrados = []; // Limpiar resultados anteriores

    // Construir los criterios de búsqueda dinámicamente
    const criteria: { comuna?: string, colegio?: string, curso?: string, asignatura?: string, rut?: string } = {};

    if (this.rutBusqueda.trim()) { // .trim() para limpiar espacios en blanco
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
      next: (data) => {
        this.usuariosEncontrados = data;
        this.loadingSearch = false;
        if (this.usuariosEncontrados.length === 0) {
          this.noResultsMessage = 'No se encontraron usuarios con los criterios seleccionados.';
        }
      },
      error: (err) => {
        console.error('Error al buscar usuarios:', err);
        this.errorMessage = err.message || 'Error al buscar usuarios. Inténtelo de nuevo.';
        this.loadingSearch = false;
        if (err.message.includes("Usuario no encontrado")) { // Manejar el 404 específico del backend
            this.noResultsMessage = err.message;
            this.errorMessage = null; // No mostrarlo como error general si es un "no encontrado"
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