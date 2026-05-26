import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/clientes/clientes.page').then((m) => m.ClientesPage),
  },
  {
    path: 'pedidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/pedidos/pedidos.page').then((m) => m.PedidosPage),
  },
  {
    path: 'historial',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historial/historial.page').then((m) => m.HistorialPage),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
  },
  {
    path: 'pagos',
    loadComponent: () => 
      import('./pages/pagos/pagos.page').then( m => m.PagosPage)
  },
  // Ruta comodín: redirige URLs desconocidas al login
  {
    path: '**',
    redirectTo: 'login',
  },
];