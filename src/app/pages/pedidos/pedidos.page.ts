import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes';
import { ProductosService } from '../../services/productos.service';
import { RepartidoresService } from '../../services/repartidores.service';
import { Pedido, EstadoPedido } from '../../models/pedido.model';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';
import { Repartidor } from '../../models/repartidor.model';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { Evidencia } from '../../models/evidencia.model';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, NavBarComponent]
})
export class PedidosPage implements OnInit {
  private pedidosService = inject(PedidosService);
  private clientesService = inject(ClientesService);
  private productosService = inject(ProductosService);
  private repartidoresService = inject(RepartidoresService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  // Data
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  repartidores: Repartidor[] = [];

  // Estado UI
  filtroActivo: EstadoPedido | 'todos' = 'todos';
  mostrarFormulario = false;
  editando = false;
  pedidoEditandoId: string | null = null;
  evidenciaAmpliada = '';

  // Formulario — producto
  productoSeleccionado = '';
  precioUnitario = 0;

  // Formulario — cliente
  clienteSeleccionadoId = '';
  busquedaCliente = '';
  clientesFiltrados: Cliente[] = [];
  mostrarDropdown = false;

  // Formulario — cantidad
  cantidad = 1;

  // Formulario — repartidor
  mostrarRepartidor = false;
  repartidorSeleccionadoId = '';
  repartidorNombre = '';

  // Formulario — notas
  mostrarNotas = false;
  notas = '';

  ngOnInit(): void {
    this.productos = this.productosService.getProductos();

    this.pedidosService.obtenerPedidos().subscribe((pedidos) => {
      this.pedidos = pedidos;
      this.aplicarFiltro();
    });

    this.clientesService.obtenerClientes().subscribe((clientes) => {
      this.clientes = clientes;
    });

    this.repartidoresService.obtenerRepartidores().subscribe((reps) => {
      this.repartidores = reps.filter((r) => r.activo);
    });
  }

  // === FILTROS ===
  aplicarFiltro(filtro: EstadoPedido | 'todos' = this.filtroActivo): void {
    this.filtroActivo = filtro;
    this.pedidosFiltrados = filtro === 'todos'
      ? this.pedidos
      : this.pedidos.filter((p) => p.estado === filtro);
  }

  contarPorEstado(estado: EstadoPedido): number {
    return this.pedidos.filter((p) => p.estado === estado).length;
  }

  // === FORMULARIO ===
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetFormulario();
  }

  cerrarSiOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.toggleFormulario();
    }
  }

  resetFormulario(): void {
    this.productoSeleccionado = '';
    this.precioUnitario = 0;
    this.clienteSeleccionadoId = '';
    this.busquedaCliente = '';
    this.clientesFiltrados = [];
    this.mostrarDropdown = false;
    this.cantidad = 1;
    this.repartidorSeleccionadoId = '';
    this.repartidorNombre = '';
    this.mostrarRepartidor = false;
    this.notas = '';
    this.mostrarNotas = false;
    this.editando = false;
    this.pedidoEditandoId = null;
  }

  // === PRODUCTO ===
  seleccionarProducto(p: Producto): void {
    this.productoSeleccionado = p.nombre;
    this.precioUnitario = p.precio;
  }

  // === CLIENTE ===
  filtrarClientes(): void {
    const q = this.busquedaCliente.toLowerCase().trim();
    if (!q) {
      this.clientesFiltrados = this.clientes.slice(0, 5);
    } else {
      this.clientesFiltrados = this.clientes
        .filter((c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.direccion.toLowerCase().includes(q)
        )
        .slice(0, 6);
    }
    this.mostrarDropdown = true;
  }

  seleccionarCliente(c: Cliente): void {
    this.clienteSeleccionadoId = c.id!;
    this.busquedaCliente = c.nombre;
    this.mostrarDropdown = false;
    this.clientesFiltrados = [];
  }

  // === CANTIDAD ===
  incrementar(): void { this.cantidad++; }
  decrementar(): void { if (this.cantidad > 1) this.cantidad--; }

  // === REPARTIDOR ===
  onRepartidorChange(): void {
    const rep = this.repartidores.find((r) => r.uid === this.repartidorSeleccionadoId);
    this.repartidorNombre = rep?.nombre ?? '';
  }

  // === TOTAL ===
  calcularTotal(): number {
    return this.precioUnitario * this.cantidad;
  }

  // === GUARDAR ===
  async guardarPedido(): Promise<void> {
    if (!this.clienteSeleccionadoId || !this.productoSeleccionado || this.cantidad < 1) {
      await this.toast('Selecciona cliente y producto', 'warning');
      return;
    }

    const cliente = this.clientes.find((c) => c.id === this.clienteSeleccionadoId);
    if (!cliente) return;

    const datosPedido = {
      clienteId: cliente.id!,
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      clienteDireccion: cliente.direccion,
      productoNombre: this.productoSeleccionado,
      precioUnitario: this.precioUnitario,
      cantidad: this.cantidad,
      total: this.calcularTotal(),
      notas: this.notas || '',
      ...(this.repartidorNombre    ? { repartidor:   this.repartidorNombre }           : {}),
      ...(this.repartidorSeleccionadoId ? { repartidorId: this.repartidorSeleccionadoId } : {})
    };

    if (this.editando && this.pedidoEditandoId) {
      await this.pedidosService.actualizarPedido(this.pedidoEditandoId, datosPedido);
      await this.toast('Pedido actualizado ✓', 'success');
    } else {
      await this.pedidosService.crearPedido(datosPedido);
      await this.toast('Pedido creado ✓', 'success');
    }

    this.toggleFormulario();
  }

  // === EDITAR ===
  editarPedido(pedido: Pedido): void {
    this.clienteSeleccionadoId = pedido.clienteId;
    this.busquedaCliente = pedido.clienteNombre;
    this.productoSeleccionado = pedido.productoNombre;
    this.precioUnitario = pedido.precioUnitario;
    this.cantidad = pedido.cantidad;
    this.notas = pedido.notas ?? '';
    this.mostrarNotas = !!pedido.notas;
    this.repartidorSeleccionadoId = pedido.repartidorId ?? '';
    this.repartidorNombre = pedido.repartidor ?? '';
    this.mostrarRepartidor = !!pedido.repartidor;
    this.editando = true;
    this.pedidoEditandoId = pedido.id!;
    this.mostrarFormulario = true;
  }

  // === AVANZAR ESTADO ===
  async avanzarEstado(pedido: Pedido): Promise<void> {
    if (pedido.estado === 'pendiente') {
      await this.pedidosService.actualizarEstado(pedido.id!, 'en-proceso');
      await this.toast('Pedido en reparto 🚚', 'primary');
      return;
    }
    if (pedido.estado === 'en-proceso') {
      this.pedidosService.pedidoActual = pedido;
      this.router.navigate(['/pagos']);
    }
  }

  // === ELIMINAR ===
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
            await this.toast('Pedido eliminado', 'danger');
          }
        }
      ]
    });
    await alert.present();
  }

  // === EVIDENCIAS ===
  verEvidencia(url: string): void {
    this.evidenciaAmpliada = url;
  }

  // === ETIQUETAS ===
  etiquetaEstado(estado: EstadoPedido): string {
    return { 'pendiente': 'Pendiente', 'en-proceso': 'Reparto', 'entregado': 'Entregado' }[estado];
  }

  etiquetaAvance(estado: EstadoPedido): string {
    return { 'pendiente': '▶ Iniciar', 'en-proceso': '💳 Cobrar', 'entregado': '✓ Listo' }[estado];
  }

  obtenerIniciales(nombre: string): string {
    return nombre.split(' ').map((p) => p[0] ?? '').join('').toUpperCase().slice(0, 2);
  }

  private async toast(mensaje: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message: mensaje, duration: 2000, position: 'top', color });
    await t.present();
  }
}