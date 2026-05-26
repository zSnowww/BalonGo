import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonInput, ToastController, AlertController } from '@ionic/angular/standalone';

import { AuthService } from '../../services/auth.service';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent]
})
export class PerfilPage implements OnInit {
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private pedidosService = inject(PedidosService);
  private clientesService = inject(ClientesService);

  correo = '';
  totalClientes = 0;
  totalPedidos = 0;
  totalEntregados = 0;

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.correo = user?.email ?? '';

    this.clientesService.obtenerClientes().subscribe((c) => {
      this.totalClientes = c.length;
    });

    this.pedidosService.obtenerPedidos().subscribe((p) => {
      this.totalPedidos = p.length;
      this.totalEntregados = p.filter((x) => x.estado === 'entregado').length;
    });
  }

  async cambiarContrasena(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar contraseña',
      inputs: [
        {
          name: 'actual',
          type: 'password',
          placeholder: 'Contraseña actual'
        },
        {
          name: 'nueva',
          type: 'password',
          placeholder: 'Nueva contraseña'
        },
        {
          name: 'confirmar',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cambiar',
          handler: async (data) => {
            if (!data.actual || !data.nueva || !data.confirmar) {
              this.mostrarToast('Completa todos los campos', 'warning');
              return false;
            }
            if (data.nueva.length < 6) {
              this.mostrarToast('La contraseña debe tener al menos 6 caracteres', 'warning');
              return false;
            }
            if (data.nueva !== data.confirmar) {
              this.mostrarToast('Las contraseñas no coinciden', 'warning');
              return false;
            }

            try {
              const user = this.authService.currentUser!;
              const credential = EmailAuthProvider.credential(user.email!, data.actual);
              await reauthenticateWithCredential(user, credential);
              await updatePassword(user, data.nueva);
              this.mostrarToast('Contraseña actualizada ✓', 'success');
              return true;
            } catch {
              this.mostrarToast('Contraseña actual incorrecta', 'danger');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async cerrarSesion(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que quieres salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          role: 'destructive',
          handler: () => this.authService.logout()
        }
      ]
    });
    await alert.present();
  }

  private async mostrarToast(mensaje: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }
}