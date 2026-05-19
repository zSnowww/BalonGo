import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private firestore = inject(Firestore);
  private clientesRef = collection(this.firestore, 'clientes');

  /** Observable en tiempo real de todos los clientes */
  obtenerClientes(): Observable<Cliente[]> {
    return collectionData(this.clientesRef, { idField: 'id' }) as Observable<Cliente[]>;
  }

  /** Agrega un nuevo cliente a Firestore */
  async agregarCliente(cliente: Omit<Cliente, 'id'>): Promise<void> {
    const iniciales = cliente.nombre
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase();

    await addDoc(this.clientesRef, {
      ...cliente,
      iniciales,
      creadoEn: serverTimestamp()
    });
  }

  /** Actualiza un cliente existente por su id */
  async actualizarCliente(id: string, datos: Partial<Cliente>): Promise<void> {
    if (datos.nombre) {
      datos.iniciales = datos.nombre
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase();
    }
    const clienteDoc = doc(this.firestore, `clientes/${id}`);
    await updateDoc(clienteDoc, { ...datos });
  }

  /** Elimina un cliente por su id */
  async eliminarCliente(id: string): Promise<void> {
    const clienteDoc = doc(this.firestore, `clientes/${id}`);
    await deleteDoc(clienteDoc);
  }
}