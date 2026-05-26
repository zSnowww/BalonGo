import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Repartidor } from '../models/repartidor.model';
import { Pedido } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class RepartidoresService {
  private db = getFirestore();

  /** Lista todos los repartidores activos */
  obtenerRepartidores(): Observable<Repartidor[]> {
    return new Observable((sub) => {
      const ref = collection(this.db, 'repartidores');
      const unsub = onSnapshot(ref, (snap) => {
        const repartidores = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Repartidor, 'id'>)
        }));
        sub.next(repartidores);
      }, (e) => sub.error(e));
      return unsub;
    });
  }

  /** Pedidos asignados a un repartidor específico (en-proceso) */
  obtenerPedidosDeRepartidor(uid: string): Observable<Pedido[]> {
    return new Observable((sub) => {
      const ref = collection(this.db, 'pedidos');
      const q = query(ref, where('repartidorId', '==', uid));
      const unsub = onSnapshot(q, (snap) => {
        const pedidos = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Pedido, 'id'>)
        }));
        sub.next(pedidos);
      }, (e) => sub.error(e));
      return unsub;
    });
  }

  async registrarRepartidor(repartidor: Omit<Repartidor, 'id'>): Promise<void> {
    await addDoc(collection(this.db, 'repartidores'), repartidor);
  }

  async actualizarRepartidor(id: string, datos: Partial<Repartidor>): Promise<void> {
    await updateDoc(doc(this.db, 'repartidores', id), { ...datos });
  }

  async eliminarRepartidor(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'repartidores', id));
  }
}
