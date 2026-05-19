import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonInput, AlertController } from '@ionic/angular/standalone';

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
    this.editando = false;
    this.pedidoEditandoId = null;
  }

  async guardarPedido(): Promise<void> {
    if (!this.clienteSeleccionadoId || this.cantidad < 1) {
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
      notas: this.notas
    };

    if (this.editando && this.pedidoEditandoId) {
      await this.pedidosService.actualizarPedido(this.pedidoEditandoId, datosPedido);
    } else {
      await this.pedidosService.crearPedido(datosPedido);
    }

    this.toggleFormulario();
  }

  editarPedido(pedido: Pedido): void {
    this.clienteSeleccionadoId = pedido.clienteId;
    this.cantidad = pedido.cantidad;
    this.notas = pedido.notas ?? '';
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
          handler: () => this.pedidosService.eliminarPedido(pedido.id!)
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
}
