import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonInput
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonInput
  ]
})

export class ProductosPage {
  productos = [
    {
      nombre: 'Balón de Gas 10kg',
      stock: 25,
      icono: '📦'
    },
    {
      nombre: 'Balón de Gas 45kg',
      stock: 10,
      icono: '🔥'
    },
    {
      nombre: 'Regulador',
      stock: 40,
      icono: '⚙️'
    }
  ];

  mostrarFormulario = false;
  editando = false;
  indiceEditando: number | null = null;
  nuevoNombre = '';
  nuevoStock: number | null = null;
  toggleFormulario() {
    this.mostrarFormulario =
      !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editando = false;
      this.indiceEditando = null;
      this.nuevoNombre = '';
      this.nuevoStock = null;
    }
  }

  guardarProducto() {
    if (
      this.nuevoNombre.trim() === '' ||
      this.nuevoStock === null
    ) {
      return;
    }
    if (this.editando && this.indiceEditando !== null) {
      this.productos[this.indiceEditando] = {
        nombre: this.nuevoNombre,
        stock: this.nuevoStock,
        icono: '📦'
      };
    } else {
      this.productos.push({
        nombre: this.nuevoNombre,
        stock: this.nuevoStock,
        icono: '📦'
      });
    }
    this.toggleFormulario();
  }

  editarProducto(index: number) {
    const producto =
      this.productos[index];
    this.nuevoNombre =
      producto.nombre;
    this.nuevoStock =
      producto.stock;
    this.editando = true;
    this.indiceEditando = index;
    this.mostrarFormulario = true;
  }

  eliminarProducto(index: number) {
    this.productos.splice(index, 1);
  }
}