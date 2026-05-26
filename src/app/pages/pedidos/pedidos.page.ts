import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonInput,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes';
import { ProductosService } from '../../services/productos.service';
import {
  Pedido,
  EstadoPedido
} from '../../models/pedido.model';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';

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
  private productosService = inject(ProductosService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  productoSeleccionado = '';
  mostrarFormulario = false;
  editando = false;
  pedidoEditandoId: string | null = null;
  filtroActivo: EstadoPedido | 'todos' = 'todos';
  clienteSeleccionadoId = '';
  cantidad = 1;
  notas = '';
  repartidor = '';
  ngOnInit(): void {
    this.productos = this.productosService.getProductos();
    this.pedidosService.obtenerPedidos()
      .subscribe((pedidos) => {
        this.pedidos = pedidos;
        this.aplicarFiltro();
      });
    this.clientesService.obtenerClientes()
      .subscribe((clientes) => {
        this.clientes = clientes;
      });
  }
  aplicarFiltro(
    filtro: EstadoPedido | 'todos' = this.filtroActivo
  ): void {
    this.filtroActivo = filtro;
    if (filtro === 'todos') {
      this.pedidosFiltrados = this.pedidos;
    } else {
      this.pedidosFiltrados =
        this.pedidos.filter(
          (p) => p.estado === filtro
        );
    }
  }
  toggleFormulario(): void {
    this.mostrarFormulario =
      !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetFormulario();
    }
  }
  resetFormulario(): void {
    this.clienteSeleccionadoId = '';
    this.productoSeleccionado = '';
    this.cantidad = 1;
    this.notas = '';
    this.repartidor = '';
    this.editando = false;
    this.pedidoEditandoId = null;
  }
  calcularTotal(): number {
    const producto = this.productos.find(
      (p) => p.nombre === this.productoSeleccionado
    );
    if (!producto) {
      return 0;
    }
    return producto.precio * this.cantidad;
  }
  async guardarPedido(): Promise<void> {
    if (
      !this.clienteSeleccionadoId ||
      !this.productoSeleccionado ||
      this.cantidad < 1
    ){
      await this.mostrarToast(
        'Completa todos los campos',
        'warning'
      );
      return;
    }
    const cliente = this.clientes.find(
      (c) => c.id === this.clienteSeleccionadoId
    );
    if (!cliente) return;
    const producto = this.productos.find(
      (p) => p.nombre === this.productoSeleccionado
    );
    if (!producto) return;
    const total =
      producto.precio * this.cantidad;
    const datosPedido = {
      clienteId: cliente.id!,
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      clienteDireccion: cliente.direccion,
      productoNombre: producto.nombre,
      precioUnitario: producto.precio,
      cantidad: this.cantidad,
      total: total,
      notas: this.notas,
      repartidor:
        this.repartidor.trim() || undefined
    };
    if (
      this.editando &&
      this.pedidoEditandoId
    ){
      await this.pedidosService.actualizarPedido(
        this.pedidoEditandoId,
        datosPedido
      );
      await this.mostrarToast(
        'Pedido actualizado ✓',
        'success'
      );
    } else {
      await this.pedidosService.crearPedido(
        datosPedido
      );
      await this.mostrarToast(
        'Pedido creado ✓',
        'success'
      );
    }
    this.toggleFormulario();
  }
  editarPedido(pedido: Pedido): void {
    this.clienteSeleccionadoId =
      pedido.clienteId;
    this.productoSeleccionado =
      pedido.productoNombre;
    this.cantidad =
      pedido.cantidad;
    this.notas =
      pedido.notas ?? '';
    this.repartidor =
      pedido.repartidor ?? '';
    this.editando = true;
    this.pedidoEditandoId =
      pedido.id!;
    this.mostrarFormulario = true;
  }
  async avanzarEstado(
    pedido: Pedido
  ): Promise<void> {
    if (pedido.estado === 'pendiente') {
      await this.pedidosService.actualizarEstado(
        pedido.id!,
        'en-proceso'
      );
      await this.mostrarToast(
        'Pedido en reparto 🚚',
        'primary'
      );
      return;
    }
    if (pedido.estado === 'en-proceso') {
      this.pedidosService.pedidoActual =
        pedido;
      this.router.navigate(['/pagos']);
      return;
    }
  }
  async confirmarEliminar(
    pedido: Pedido
  ): Promise<void> {
    const alert =
      await this.alertCtrl.create({
      header: 'Eliminar pedido',
      message:
        `¿Eliminar el pedido de ${pedido.clienteNombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.pedidosService
              .eliminarPedido(pedido.id!);
            await this.mostrarToast(
              'Pedido eliminado',
              'danger'
            );
          }
        }
      ]
    });
    await alert.present();
  }
  etiquetaEstado(
    estado: EstadoPedido
  ): string {
    const etiquetas:
      Record<EstadoPedido, string> = {
      'pendiente': 'Pendiente',
      'en-proceso': 'En proceso',
      'entregado': 'Entregado'
    };
    return etiquetas[estado];
  }
  etiquetaAvance(
    estado: EstadoPedido
  ): string {
    const etiquetas:
      Record<EstadoPedido, string> = {
      'pendiente': '▶ Iniciar',
      'en-proceso': '✓ Entregar',
      'entregado': '✓ Listo'
    };
    return etiquetas[estado];
  }
  contarPorEstado(
    estado: EstadoPedido
  ): number {
    return this.pedidos.filter(
      (p) => p.estado === estado
    ).length;
  }
  obtenerIniciales(
    nombre: string
  ): string {
    return nombre
      .split(' ')
      .map((p) => p[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  private async mostrarToast(
    mensaje: string,
    color: string
  ): Promise<void> {
    const toast =
      await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}