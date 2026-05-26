import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { repartidorGuard } from './guards/repartidor.guard';

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
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/productos/productos.page').then((m) => m.ProductosPage),
  },
  {
    path: 'pagos',
    loadComponent: () =>
      import('./pages/pagos/pagos.page').then((m) => m.PagosPage)
  },
  // === MÓDULO REPARTIDOR ===
  {
    path: 'repartidor-login',
    loadComponent: () =>
      import('./pages/repartidor-login/repartidor-login.page').then(
        (m) => m.RepartidorLoginPage
      ),
  },
  {
    path: 'repartidor',
    canActivate: [repartidorGuard],
    loadComponent: () =>
      import('./pages/repartidor/repartidor.page').then((m) => m.RepartidorPage),
  },
  // Ruta comodín
  {
    path: '**',
    redirectTo: 'login',
  },
];