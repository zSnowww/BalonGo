import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Pedido, EstadoPedido } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private firestore = inject(Firestore);
  private pedidosRef = collection(this.firestore, 'pedidos');

  /** Observable en tiempo real de todos los pedidos, ordenados por fecha desc */
  obtenerPedidos(): Observable<Pedido[]> {
    const q = query(this.pedidosRef, orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Pedido[]>;
  }

  /** Crea un nuevo pedido con estado inicial "pendiente" */
  async crearPedido(pedido: Omit<Pedido, 'id' | 'estado' | 'fecha'>): Promise<void> {
    await addDoc(this.pedidosRef, {
      ...pedido,
      estado: 'pendiente' as EstadoPedido,
      fecha: serverTimestamp()
    });
  }

  /** Actualiza el estado de un pedido: pendiente → en-proceso → entregado */
  async actualizarEstado(id: string, estado: EstadoPedido): Promise<void> {
    const pedidoDoc = doc(this.firestore, `pedidos/${id}`);
    await updateDoc(pedidoDoc, { estado });
  }

  /** Actualiza los datos de un pedido existente */
  async actualizarPedido(id: string, datos: Partial<Pedido>): Promise<void> {
    const pedidoDoc = doc(this.firestore, `pedidos/${id}`);
    await updateDoc(pedidoDoc, { ...datos });
  }

  /** Elimina un pedido por su id */
  async eliminarPedido(id: string): Promise<void> {
    const pedidoDoc = doc(this.firestore, `pedidos/${id}`);
    await deleteDoc(pedidoDoc);
  }
}
