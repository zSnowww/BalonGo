import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then(
        (m) => m.DashboardPage
      ),
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/clientes.page').then(
        (m) => m.ClientesPage
      ),
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./pages/productos/productos.page').then(
        (m) => m.ProductosPage
      ),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil.page').then(
        (m) => m.PerfilPage
      ),
  },
];