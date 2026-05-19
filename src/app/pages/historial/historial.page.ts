import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonInput } from '@ionic/angular/standalone';

import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonInput]
})
export class HistorialPage implements OnInit {
  private pedidosService = inject(PedidosService);

  todosEntregados: Pedido[] = [];
  entregadosFiltrados: Pedido[] = [];
  busqueda = '';
  filtroFecha: 'hoy' | 'semana' | 'mes' | 'todos' = 'todos';

  // Estadísticas
  totalEntregas = 0;
  totalBalones = 0;

  ngOnInit(): void {
    this.pedidosService.obtenerPedidos().subscribe((pedidos) => {
      this.todosEntregados = pedidos.filter((p) => p.estado === 'entregado');
      this.calcularEstadisticas();
      this.aplicarFiltros();
    });
  }

  calcularEstadisticas(): void {
    this.totalEntregas = this.todosEntregados.length;
    this.totalBalones = this.todosEntregados.reduce((sum, p) => sum + p.cantidad, 0);
  }

  aplicarFiltros(): void {
    let resultado = [...this.todosEntregados];

    // Filtro por fecha
    if (this.filtroFecha !== 'todos') {
      const ahora = new Date();
      const inicio = new Date();

      if (this.filtroFecha === 'hoy') {
        inicio.setHours(0, 0, 0, 0);
      } else if (this.filtroFecha === 'semana') {
        inicio.setDate(ahora.getDate() - 7);
      } else if (this.filtroFecha === 'mes') {
        inicio.setMonth(ahora.getMonth() - 1);
      }

      resultado = resultado.filter((p) => {
        if (!p.fecha) return false;
        const fechaPedido = p.fecha.toDate ? p.fecha.toDate() : new Date(p.fecha);
        return fechaPedido >= inicio;
      });
    }

    // Filtro por búsqueda
    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.clienteNombre.toLowerCase().includes(termino) ||
          p.clienteDireccion.toLowerCase().includes(termino) ||
          (p.repartidor && p.repartidor.toLowerCase().includes(termino))
      );
    }

    this.entregadosFiltrados = resultado;
  }

  setFiltroFecha(filtro: 'hoy' | 'semana' | 'mes' | 'todos'): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return '';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
