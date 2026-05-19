export type EstadoPedido = 'pendiente' | 'en-proceso' | 'entregado';

export interface Pedido {
  id?: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteDireccion: string;
  cantidad: number;
  estado: EstadoPedido;
  fecha: Date | any;
  notas?: string;
  repartidor?: string;
}
