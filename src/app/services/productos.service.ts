import { Injectable } from '@angular/core';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private _productos: Producto[] = [
    {
      nombre: 'Balón de Gas 10kg',
      tipo: '10kg',
      precio: 35,
      stock: 25,
      icono: '📦'
    },
    {
      nombre: 'Balón de Gas 15kg',
      tipo: '15kg',
      precio: 55,
      stock: 18,
      icono: '🛢️'
    },
    {
      nombre: 'Balón de Gas 45kg',
      tipo: '45kg',
      precio: 160,
      stock: 10,
      icono: '🔥'
    }
  ];

  getProductos(): Producto[] {
    return this._productos;
  }

  agregarProducto(producto: Producto): void {
    this._productos.push(producto);
  }

  actualizarProducto(index: number, producto: Producto): void {
    this._productos[index] = producto;
  }

  eliminarProducto(index: number): void {
    this._productos.splice(index, 1);
  }
}
