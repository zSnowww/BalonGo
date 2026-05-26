import { Evidencia } from './evidencia.model';

export type EstadoPedido =
  | 'pendiente'
  | 'en-proceso'
  | 'entregado';

export interface Pedido {
  id?: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteDireccion: string;
  productoNombre: string;
  precioUnitario: number;
  cantidad: number;
  total: number;
  estado: EstadoPedido;
  fecha: Date | any;
  notas?: string;
  repartidor?: string;
  repartidorId?: string;
  evidencias?: Evidencia[];
}