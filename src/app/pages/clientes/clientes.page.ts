import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonInput
} from '@ionic/angular/standalone';

import { ClientesService }
from '../../services/clientes';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonInput
  ]
})

export class ClientesPage {
  clientes: any[] = [];
  mostrarFormulario = false;
  nuevoNombre = '';
  nuevoTelefono = '';
  editando = false;
  indiceEditando: number | null = null;
  constructor(
    private clientesService:
    ClientesService
  ) {
    this.clientes =
      this.clientesService
        .obtenerClientes();
  }

  toggleFormulario() {
    this.mostrarFormulario =
      !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.nuevoNombre = '';
      this.nuevoTelefono = '';
      this.editando = false;
      this.indiceEditando = null;
    }
  }

  guardarCliente() {
    if (
      this.nuevoNombre.trim() === '' ||
      this.nuevoTelefono.trim() === ''
    ) {
      return;
    }
    if (this.editando && this.indiceEditando !== null) {
      const iniciales =
        this.nuevoNombre
          .split(' ')
          .map(p => p[0])
          .join('')
          .toUpperCase();
      this.clientes[this.indiceEditando] = {
        nombre: this.nuevoNombre,
        telefono: this.nuevoTelefono,
        iniciales
      };
    } else {
      this.clientesService.agregarCliente(
        this.nuevoNombre,
        this.nuevoTelefono
      );
    }
    this.nuevoNombre = '';
    this.nuevoTelefono = '';
    this.editando = false;
    this.indiceEditando = null;
    this.mostrarFormulario = false;
  }

  editarCliente(index: number) {
    const cliente = this.clientes[index];
    this.nuevoNombre = cliente.nombre;
    this.nuevoTelefono = cliente.telefono;
    this.editando = true;
    this.indiceEditando = index;
    this.mostrarFormulario = true;
  }

  eliminarCliente(index: number) {
    this.clientes.splice(index, 1);
  }
}