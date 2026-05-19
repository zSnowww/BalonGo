import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private db = getFirestore();

  /** Observable en tiempo real de todos los clientes */
  obtenerClientes(): Observable<Cliente[]> {
    return new Observable((subscriber) => {
      const ref = collection(this.db, 'clientes');
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          const clientes = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Cliente, 'id'>)
          }));
          subscriber.next(clientes);
        },
        (error) => subscriber.error(error)
      );
      return unsub; // se llama automáticamente al unsubscribe
    });
  }

  async agregarCliente(cliente: Omit<Cliente, 'id'>): Promise<void> {
    const iniciales = cliente.nombre
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase();
    await addDoc(collection(this.db, 'clientes'), {
      ...cliente,
      iniciales,
      creadoEn: serverTimestamp()
    });
  }

  async actualizarCliente(id: string, datos: Partial<Cliente>): Promise<void> {
    if (datos.nombre) {
      datos.iniciales = datos.nombre
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase();
    }
    await updateDoc(doc(this.db, 'clientes', id), { ...datos });
  }

  async eliminarCliente(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'clientes', id));
  }
}