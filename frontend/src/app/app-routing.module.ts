// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component'; // Asegúrate de importar HomeComponent

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent }, // Ruta para tu página de inicio
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige la ruta raíz a login por defecto
  { path: '**', redirectTo: '/login' } // Opcional: Redirige rutas no encontradas a login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }