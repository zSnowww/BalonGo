import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes';
import { AuthService } from '../../services/auth.service';
import { Pedido, EstadoPedido } from '../../models/pedido.model';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, NavBarComponent]
})
export class DashboardPage implements OnInit {
  private pedidosService = inject(PedidosService);
  private clientesService = inject(ClientesService);
  private authService = inject(AuthService);

  totalClientes = 0;
  pendientes = 0;
  enProceso = 0;
  entregados = 0;
  ultimosPedidos: Pedido[] = [];

  get nombreUsuario(): string {
    const user = this.authService.currentUser;
    return user?.displayName ?? user?.email?.split('@')[0] ?? 'Admin';
  }

  get iniciales(): string {
    return this.nombreUsuario.slice(0, 2).toUpperCase();
  }

  get saludo(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  ngOnInit(): void {
    this.clientesService.obtenerClientes().subscribe((clientes) => {
      this.totalClientes = clientes.length;
    });

    this.pedidosService.obtenerPedidos().subscribe((pedidos) => {
      this.pendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
      this.enProceso = pedidos.filter((p) => p.estado === 'en-proceso').length;
      this.entregados = pedidos.filter((p) => p.estado === 'entregado').length;
      this.ultimosPedidos = pedidos.slice(0, 5);
    });
  }

  etiqueta(estado: EstadoPedido): string {
    const m: Record<EstadoPedido, string> = {
      'pendiente': 'Pendiente',
      'en-proceso': 'Reparto',
      'entregado': 'Entregado'
    };
    return m[estado];
  }
}