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
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Pedido, EstadoPedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})

export class PedidosService {
  pedidoActual: Pedido | null = null;
  private db = getFirestore();
  obtenerPedidos(): Observable<Pedido[]> {
    return new Observable((subscriber) => {
      const ref = collection(
        this.db,
        'pedidos'
      );
      const q = query(
        ref,
        orderBy('fecha', 'desc')
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const pedidos = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Pedido, 'id'>)
          }));
          subscriber.next(pedidos);
        },
        (error: Error) => subscriber.error(error)
      );
      return unsub;
    });
  }
  async crearPedido(
    pedido: Omit<
      Pedido,
      'id' | 'estado' | 'fecha'
    >
  ): Promise<void> {
    await addDoc(
      collection(this.db, 'pedidos'),
      {
        ...pedido,
        estado: 'pendiente' as EstadoPedido,
        fecha: serverTimestamp()
      }
    );
  }
  async actualizarEstado(
    id: string,
    estado: EstadoPedido
  ): Promise<void> {
    await updateDoc(
      doc(this.db, 'pedidos', id),
      { estado }
    );
  }
  async actualizarPedido(
    id: string,
    datos: Partial<Pedido>
  ): Promise<void> {
    await updateDoc(
      doc(this.db, 'pedidos', id),
      { ...datos }
    );
  }
  async eliminarPedido(
    id: string
  ): Promise<void> {
    await deleteDoc(
      doc(this.db, 'pedidos', id)
    );
  }
}