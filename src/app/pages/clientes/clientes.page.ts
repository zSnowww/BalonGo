import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, AlertController, ToastController } from '@ionic/angular/standalone';
import { ClientesService } from '../../services/clientes';
import { Cliente } from '../../models/cliente.model';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, NavBarComponent]
})
export class ClientesPage implements OnInit {
  private clientesService = inject(ClientesService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  busqueda = '';
  mostrarFormulario = false;
  editando = false;
  clienteEditandoId: string | null = null;

  nuevoNombre = '';
  nuevoTelefono = '';
  nuevaDireccion = '';

  ngOnInit(): void {
    this.clientesService.obtenerClientes().subscribe((clientes) => {
      this.clientes = clientes;
      this.aplicarBusqueda();
    });
  }

  aplicarBusqueda(): void {
    const termino = this.busqueda.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(termino) ||
        c.telefono.includes(termino) ||
        c.direccion.toLowerCase().includes(termino)
    );
  }

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
    this.nuevoNombre = '';
    this.nuevoTelefono = '';
    this.nuevaDireccion = '';
    this.editando = false;
    this.clienteEditandoId = null;
  }

  async guardarCliente(): Promise<void> {
    if (!this.nuevoNombre.trim() || !this.nuevoTelefono.trim() || !this.nuevaDireccion.trim()) {
      await this.mostrarToast('Completa todos los campos', 'warning');
      return;
    }

    // Validar duplicado por teléfono
    const telefonoExiste = this.clientes.find(
      (c) => c.telefono === this.nuevoTelefono.trim() && c.id !== this.clienteEditandoId
    );
    if (telefonoExiste) {
      await this.mostrarToast(`El teléfono ya pertenece a ${telefonoExiste.nombre}`, 'warning');
      return;
    }

    const datos = {
      nombre: this.nuevoNombre.trim(),
      telefono: this.nuevoTelefono.trim(),
      direccion: this.nuevaDireccion.trim(),
      iniciales: ''
    };

    if (this.editando && this.clienteEditandoId) {
      await this.clientesService.actualizarCliente(this.clienteEditandoId, datos);
      await this.mostrarToast('Cliente actualizado ✓', 'success');
    } else {
      await this.clientesService.agregarCliente(datos);
      await this.mostrarToast('Cliente registrado ✓', 'success');
    }

    this.toggleFormulario();
  }

  editarCliente(cliente: Cliente): void {
    this.nuevoNombre = cliente.nombre;
    this.nuevoTelefono = cliente.telefono;
    this.nuevaDireccion = cliente.direccion;
    this.editando = true;
    this.clienteEditandoId = cliente.id!;
    this.mostrarFormulario = true;
  }

  async confirmarEliminar(cliente: Cliente): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cliente',
      message: `¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.clientesService.eliminarCliente(cliente.id!);
            await this.mostrarToast('Cliente eliminado', 'danger');
          }
        }
      ]
    });
    await alert.present();
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