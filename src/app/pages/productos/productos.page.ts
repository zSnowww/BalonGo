import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonInput
} from '@ionic/angular/standalone';
import { Producto } from '../../models/producto.model';
import { ProductosService } from '../../services/productos.service';

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
  private productosService = inject(ProductosService);

  get productos(): Producto[] {
    return this.productosService.getProductos();
  }

  busqueda = '';
  mostrarFormulario = false;
  editando = false;
  indiceEditando: number | null = null;
  nuevoNombre = '';
  nuevoTipo = '';
  nuevoPrecio: number | null = null;
  nuevoStock: number | null = null;
  nuevoIcono = '📦';

  productosFiltrados(): Producto[] {
    return this.productos.filter((producto) =>
      producto.nombre
        .toLowerCase()
        .includes(this.busqueda.toLowerCase())
    );
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editando = false;
      this.indiceEditando = null;
      this.nuevoNombre = '';
      this.nuevoTipo = '';
      this.nuevoPrecio = null;
      this.nuevoStock = null;
      this.nuevoIcono = '📦';
    }
  }

  guardarProducto() {
    if (
      this.nuevoNombre.trim() === '' ||
      this.nuevoTipo.trim() === '' ||
      this.nuevoPrecio === null ||
      this.nuevoStock === null
    ) {
      return;
    }
    const producto: Producto = {
      nombre: this.nuevoNombre,
      tipo: this.nuevoTipo,
      precio: this.nuevoPrecio,
      stock: this.nuevoStock,
      icono: this.nuevoIcono || '📦'
    };
    if (this.editando && this.indiceEditando !== null) {
      this.productosService.actualizarProducto(this.indiceEditando, producto);
    } else {
      this.productosService.agregarProducto(producto);
    }
    this.toggleFormulario();
  }

  editarProducto(index: number) {
    const producto = this.productos[index];
    this.nuevoNombre = producto.nombre;
    this.nuevoTipo = producto.tipo;
    this.nuevoPrecio = producto.precio;
    this.nuevoStock = producto.stock;
    this.nuevoIcono = producto.icono;
    this.editando = true;
    this.indiceEditando = index;
    this.mostrarFormulario = true;
  }

  eliminarProducto(index: number) {
    this.productosService.eliminarProducto(index);
  }
}