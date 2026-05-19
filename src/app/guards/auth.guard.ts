import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a que Firebase resuelva el estado de autenticación
  const user = await authService.waitForAuth();

  if (user) {
    return true;
  }

  await router.navigate(['/login'], { replaceUrl: true });
  return false;
};
