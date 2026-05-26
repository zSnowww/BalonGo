import { Injectable } from '@angular/core';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Evidencia } from '../models/evidencia.model';

@Injectable({ providedIn: 'root' })
export class EvidenciasService {
  private storage = getStorage();
  private db = getFirestore();

  /**
   * Sube una imagen a Firebase Storage y guarda el registro en Firestore.
   */
  async subirEvidencia(
    pedidoId: string,
    file: File,
    tipo: Evidencia['tipo'],
    repartidorId: string,
    nota?: string
  ): Promise<string> {
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `evidencias/${pedidoId}/${timestamp}.${ext}`;
    const storageRef = ref(this.storage, path);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(this.db, 'evidencias'), {
      pedidoId,
      tipo,
      url,
      nota: nota ?? '',
      repartidorId,
      fecha: serverTimestamp()
    });

    return url;
  }

  /** Observable con las evidencias de un pedido */
  obtenerEvidencias(pedidoId: string): Observable<Evidencia[]> {
    return new Observable((sub) => {
      const colRef = collection(this.db, 'evidencias');
      const q = query(
        colRef,
        where('pedidoId', '==', pedidoId)
      );
      const unsub = onSnapshot(q, (snap) => {
        const evidencias = snap.docs
          .map((d) => ({ ...(d.data() as Evidencia) }))
          .sort((a, b) => {
            const ta = a.fecha?.toMillis?.() ?? a.fecha?.seconds ?? 0;
            const tb = b.fecha?.toMillis?.() ?? b.fecha?.seconds ?? 0;
            return ta - tb;
          });
        sub.next(evidencias);
      }, (e) => sub.error(e));
      return unsub;
    });
  }
}
