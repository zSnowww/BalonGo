export interface Evidencia {
  tipo: 'entrega' | 'pago' | 'otro';
  url: string;
  nota?: string;
  fecha: Date | any;
  repartidorId?: string;
}
