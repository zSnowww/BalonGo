import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  ToastController
} from '@ionic/angular/standalone';
import { QRCodeComponent } from 'angularx-qrcode';
import { Pedido } from '../../models/pedido.model';
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    QRCodeComponent
  ]
})

export class PagosPage implements OnInit {
  private router = inject(Router);
  private pedidosService = inject(PedidosService);
  private toastCtrl = inject(ToastController);
  pedido!: Pedido;
  total = 0;
  qrData = '';
  ngOnInit(): void {
    const pedidoGuardado =
      this.pedidosService.pedidoActual;
    if (pedidoGuardado) {
      this.pedido = pedidoGuardado;
      this.total = this.pedido.total;
      this.generarQR();
    } else {
      this.router.navigate(['/pedidos']);
    }
  }
  generarQR(): void {
    /*
      Simulación Mercado Pago
      Luego puedes reemplazar
      esto con una API real.
    */
    this.qrData =
      `https://mpago.la/pagar?cliente=${this.pedido.clienteNombre}&monto=${this.total}`;
  }
  async confirmarPagoDigital(): Promise<void> {
    await this.pedidosService.actualizarEstado(
      this.pedido.id!,
      'entregado'
    );
    await this.mostrarToast(
      'Pago confirmado correctamente ✓',
      'success'
    );
    this.router.navigate(['/pedidos']);
  }
  async confirmarPagoEfectivo(): Promise<void> {
    await this.pedidosService.actualizarEstado(
      this.pedido.id!,
      'entregado'
    );
    await this.mostrarToast(
      'Pago en efectivo registrado 💵',
      'success'
    );
    this.router.navigate(['/pedidos']);
  }
  cancelarPago(): void {
    this.router.navigate(['/pedidos']);
  }
  obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map(p => p[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  private async mostrarToast(
    mensaje: string,
    color: string
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2200,
      position: 'top',
      color
    });
    await toast.present();
  }
}