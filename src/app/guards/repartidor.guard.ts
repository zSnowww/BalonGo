import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const repartidorGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    router.navigate(['/repartidor-login']);
    return false;
  }

  // Verificar que el usuario existe en la colección repartidores
  const db = getFirestore();
  const q = query(
    collection(db, 'repartidores'),
    where('uid', '==', user.uid),
    where('activo', '==', true)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    router.navigate(['/repartidor-login']);
    return false;
  }

  return true;
};
