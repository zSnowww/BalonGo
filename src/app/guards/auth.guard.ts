import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

/**
 * AuthGuard — Protege las rutas privadas.
 * Redirige al login si el usuario no tiene sesión activa.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    map((currentUser) => {
      if (currentUser) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
