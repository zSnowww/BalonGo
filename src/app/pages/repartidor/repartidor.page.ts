import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ToastController, AlertController } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { RepartidoresService } from '../../services/repartidores.service';
import { EvidenciasService } from '../../services/evidencias.service';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido.model';
import { Evidencia } from '../../models/evidencia.model';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

@Component({
  selector: 'app-repartidor',
  templateUrl: './repartidor.page.html',
  styleUrls: ['./repartidor.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent]
})
export class RepartidorPage implements OnInit {
  private authService = inject(AuthService);
  private repartidoresService = inject(RepartidoresService);
  private evidenciasService = inject(EvidenciasService);
  private pedidosService = inject(PedidosService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  nombreRepartidor = '';
  pedidos: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;
  evidencias: Evidencia[] = [];
  evidenciaAmpliada = '';
  subiendo = false;
  uid = '';

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.uid = user?.uid ?? '';
    this.nombreRepartidor = user?.displayName ?? user?.email?.split('@')[0] ?? 'Repartidor';

    this.repartidoresService.obtenerPedidosDeRepartidor(this.uid)
      .subscribe((pedidos) => {
        this.pedidos = pedidos.filter((p) =>
          p.estado === 'en-proceso' || p.estado === 'pendiente'
        );
      });
  }

  abrirPedido(pedido: Pedido): void {
    this.pedidoSeleccionado = pedido;
    this.cargarEvidencias(pedido.id!);
  }

  cerrarPedido(): void {
    this.pedidoSeleccionado = null;
    this.evidencias = [];
  }

  cargarEvidencias(pedidoId: string): void {
    this.evidenciasService.obtenerEvidencias(pedidoId)
      .subscribe((evs) => {
        this.evidencias = evs;
      });
  }

  // Dispara el input de archivo
  seleccionarImagen(tipo: Evidencia['tipo']): void {
    const input = document.getElementById(`file-input-${tipo}`) as HTMLInputElement;
    input?.click();
  }

  async onFileSelected(event: Event, tipo: Evidencia['tipo']): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.pedidoSeleccionado) return;

    this.subiendo = true;
    try {
      await this.evidenciasService.subirEvidencia(
        this.pedidoSeleccionado.id!,
        file,
        tipo,
        this.uid
      );
      await this.toast('Evidencia subida ✓', 'success');
    } catch (err) {
      await this.toast('Error al subir imagen', 'danger');
    } finally {
      this.subiendo = false;
    }
  }

  async marcarEntregado(): Promise<void> {
    if (!this.pedidoSeleccionado) return;
    if (this.evidencias.length === 0) {
      await this.toast('Sube al menos una evidencia primero', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar entrega',
      message: `¿Marcar el pedido de ${this.pedidoSeleccionado.clienteNombre} como entregado?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.pedidosService.actualizarEstado(
              this.pedidoSeleccionado!.id!,
              'entregado'
            );
            await this.toast('Entrega confirmada ✓', 'success');
            this.cerrarPedido();
          }
        }
      ]
    });
    await alert.present();
  }

  verEvidencia(url: string): void {
    this.evidenciaAmpliada = url;
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.logout();
  }

  etiquetaTipo(tipo: Evidencia['tipo']): string {
    const t = { 'entrega': 'Foto de entrega', 'pago': 'Foto de pago', 'otro': 'Otro' };
    return t[tipo];
  }

  private async toast(msg: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'top', color });
    await t.present();
  }
}
