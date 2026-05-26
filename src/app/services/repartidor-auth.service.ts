import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Repartidor } from '../models/repartidor.model';

@Injectable({ providedIn: 'root' })
export class RepartidorAuthService {
  private db = getFirestore();

  /**
   * Crea un usuario en Firebase Auth con una app secundaria (para no cerrar la sesión del admin)
   * y luego registra el repartidor en Firestore.
   */
  async crearRepartidor(
    nombre: string,
    email: string,
    password: string
  ): Promise<void> {
    // Usamos una app secundaria para no afectar la sesión del admin
    const secondaryAppName = 'repartidor-creation';
    const existingApps = getApps();
    const secondaryApp = existingApps.find((a) => a.name === secondaryAppName)
      ?? initializeApp(environment.firebase, secondaryAppName);

    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;

    await updateProfile(cred.user, { displayName: nombre });

    // Registrar en Firestore colección repartidores
    await addDoc(collection(this.db, 'repartidores'), {
      uid,
      nombre,
      email,
      activo: true
    } as Omit<Repartidor, 'id'>);

    // Cerrar sesión de la app secundaria
    await secondaryAuth.signOut();
  }

  async desactivarRepartidor(id: string): Promise<void> {
    await updateDoc(doc(this.db, 'repartidores', id), { activo: false });
  }

  async activarRepartidor(id: string): Promise<void> {
    await updateDoc(doc(this.db, 'repartidores', id), { activo: true });
  }

  async eliminarRepartidor(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'repartidores', id));
  }
}
