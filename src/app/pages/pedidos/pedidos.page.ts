import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonInput, AlertController, ToastController } from '@ionic/angular/standalone';

import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes';
import { Pedido, EstadoPedido } from '../../models/pedido.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonInput
  ]
})
export class PedidosPage implements OnInit {
  private pedidosService = inject(PedidosService);
  private clientesService = inject(ClientesService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  clientes: Cliente[] = [];

  mostrarFormulario = false;
  editando = false;
  pedidoEditandoId: string | null = null;
  filtroActivo: EstadoPedido | 'todos' = 'todos';

  // Campos del formulario
  clienteSeleccionadoId = '';
  cantidad = 1;
  notas = '';
  repartidor = '';

  ngOnInit(): void {
    this.pedidosService.obtenerPedidos().subscribe((pedidos) => {
      this.pedidos = pedidos;
      this.aplicarFiltro();
    });

    this.clientesService.obtenerClientes().subscribe((clientes) => {
      this.clientes = clientes;
    });
  }

  aplicarFiltro(filtro: EstadoPedido | 'todos' = this.filtroActivo): void {
    this.filtroActivo = filtro;
    if (filtro === 'todos') {
      this.pedidosFiltrados = this.pedidos;
    } else {
      this.pedidosFiltrados = this.pedidos.filter((p) => p.estado === filtro);
    }
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetFormulario();
    }
  }

  resetFormulario(): void {
    this.clienteSeleccionadoId = '';
    this.cantidad = 1;
    this.notas = '';
    this.repartidor = '';
    this.editando = false;
    this.pedidoEditandoId = null;
  }

  async guardarPedido(): Promise<void> {
    if (!this.clienteSeleccionadoId || this.cantidad < 1) {
      await this.mostrarToast('Selecciona un cliente y cantidad', 'warning');
      return;
    }

    const cliente = this.clientes.find((c) => c.id === this.clienteSeleccionadoId);
    if (!cliente) return;

    const datosPedido = {
      clienteId: cliente.id!,
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      clienteDireccion: cliente.direccion,
      cantidad: this.cantidad,
      notas: this.notas,
      repartidor: this.repartidor.trim() || undefined
    };

    if (this.editando && this.pedidoEditandoId) {
      await this.pedidosService.actualizarPedido(this.pedidoEditandoId, datosPedido);
      await this.mostrarToast('Pedido actualizado ✓', 'success');
    } else {
      await this.pedidosService.crearPedido(datosPedido);
      await this.mostrarToast('Pedido creado ✓', 'success');
    }

    this.toggleFormulario();
  }

  editarPedido(pedido: Pedido): void {
    this.clienteSeleccionadoId = pedido.clienteId;
    this.cantidad = pedido.cantidad;
    this.notas = pedido.notas ?? '';
    this.repartidor = pedido.repartidor ?? '';
    this.editando = true;
    this.pedidoEditandoId = pedido.id!;
    this.mostrarFormulario = true;
  }

  async avanzarEstado(pedido: Pedido): Promise<void> {
    const siguiente: Record<EstadoPedido, EstadoPedido | null> = {
      'pendiente': 'en-proceso',
      'en-proceso': 'entregado',
      'entregado': null
    };
    const nuevoEstado = siguiente[pedido.estado];
    if (nuevoEstado) {
      await this.pedidosService.actualizarEstado(pedido.id!, nuevoEstado);
      const msg = nuevoEstado === 'en-proceso' ? 'Pedido en reparto 🚚' : 'Pedido entregado ✓';
      await this.mostrarToast(msg, nuevoEstado === 'entregado' ? 'success' : 'primary');
    }
  }

  async confirmarEliminar(pedido: Pedido): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar pedido',
      message: `¿Eliminar el pedido de ${pedido.clienteNombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.pedidosService.eliminarPedido(pedido.id!);
            await this.mostrarToast('Pedido eliminado', 'danger');
          }
        }
      ]
    });
    await alert.present();
  }

  etiquetaEstado(estado: EstadoPedido): string {
    const etiquetas: Record<EstadoPedido, string> = {
      'pendiente': 'Pendiente',
      'en-proceso': 'En proceso',
      'entregado': 'Entregado'
    };
    return etiquetas[estado];
  }

  etiquetaAvance(estado: EstadoPedido): string {
    const etiquetas: Record<EstadoPedido, string> = {
      'pendiente': '▶ Iniciar',
      'en-proceso': '✓ Entregar',
      'entregado': '✓ Listo'
    };
    return etiquetas[estado];
  }

  contarPorEstado(estado: EstadoPedido): number {
    return this.pedidos.filter((p) => p.estado === estado).length;
  }

  obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map((p) => p[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private async mostrarToast(mensaje: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
