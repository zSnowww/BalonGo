import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes';
import { AuthService } from '../../services/auth.service';
import { Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent]
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
    return user?.displayName ?? user?.email?.split('@')[0] ?? 'Usuario';
  }

  ngOnInit(): void {
    this.clientesService.obtenerClientes().subscribe((clientes) => {
      this.totalClientes = clientes.length;
    });

    this.pedidosService.obtenerPedidos().subscribe((pedidos) => {
      this.pendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
      this.enProceso = pedidos.filter((p) => p.estado === 'en-proceso').length;
      this.entregados = pedidos.filter((p) => p.estado === 'entregado').length;
      this.ultimosPedidos = pedidos.slice(0, 3);
    });
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.logout();
  }
}