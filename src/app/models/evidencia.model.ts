export interface Evidencia {
  tipo: 'entrega' | 'pago' | 'firma' | 'otro';
  url: string;
  nota?: string;
  fecha: Date | any;
  repartidorId?: string;
}
