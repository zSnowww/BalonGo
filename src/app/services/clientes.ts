import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ClientesService {

  clientes = [
    {
      nombre: 'Ana Torres',
      telefono: '987 654 321',
      iniciales: 'AT'
    },
    {
      nombre: 'Juan Pérez',
      telefono: '912 345 678',
      iniciales: 'JP'
    },
    {
      nombre: 'María López',
      telefono: '965 741 258',
      iniciales: 'ML'
    }
  ];
  obtenerClientes() {
    return this.clientes;
  }
  agregarCliente(
    nombre: string,
    telefono: string
  ) 
  {
    const iniciales =
      nombre
        .split(' ')
        .map(p => p[0])
        .join('')
        .toUpperCase();
    this.clientes.push({
      nombre,
      telefono,
      iniciales
    });
  }
}