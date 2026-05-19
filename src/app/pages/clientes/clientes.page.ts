import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonInput, AlertController } from '@ionic/angular/standalone';

import { ClientesService } from '../../services/clientes';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonInput]
})
export class ClientesPage implements OnInit {
  private clientesService = inject(ClientesService);
  private alertCtrl = inject(AlertController);

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
    if (!this.mostrarFormulario) {
      this.resetFormulario();
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
    } else {
      await this.clientesService.agregarCliente(datos);
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
          handler: () => this.clientesService.eliminarCliente(cliente.id!)
        }
      ]
    });
    await alert.present();
  }
}