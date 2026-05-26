import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ToastController, AlertController } from '@ionic/angular/standalone';
import { RepartidoresService } from '../../services/repartidores.service';
import { RepartidorAuthService } from '../../services/repartidor-auth.service';
import { Repartidor } from '../../models/repartidor.model';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-repartidores',
  templateUrl: './repartidores.page.html',
  styleUrls: ['./repartidores.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, NavBarComponent]
})
export class RepartidoresPage implements OnInit {
  private repartidoresService = inject(RepartidoresService);
  private repartidorAuthService = inject(RepartidorAuthService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  repartidores: Repartidor[] = [];
  mostrarFormulario = false;
  cargando = false;

  // Formulario
  nuevoNombre = '';
  nuevoEmail = '';
  nuevaPassword = '';
  mostrarPassword = false;

  ngOnInit(): void {
    this.repartidoresService.obtenerRepartidores().subscribe((reps) => {
      this.repartidores = reps;
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetFormulario();
  }

  cerrarSiOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.toggleFormulario();
    }
  }

  resetFormulario(): void {
    this.nuevoNombre = '';
    this.nuevoEmail = '';
    this.nuevaPassword = '';
    this.mostrarPassword = false;
  }

  async crearRepartidor(): Promise<void> {
    if (!this.nuevoNombre.trim() || !this.nuevoEmail.trim() || !this.nuevaPassword.trim()) {
      await this.toast('Completa todos los campos', 'warning');
      return;
    }
    if (this.nuevaPassword.length < 6) {
      await this.toast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    this.cargando = true;
    try {
      await this.repartidorAuthService.crearRepartidor(
        this.nuevoNombre.trim(),
        this.nuevoEmail.trim(),
        this.nuevaPassword
      );
      await this.toast(`Repartidor "${this.nuevoNombre.trim()}" creado ✓`, 'success');
      this.toggleFormulario();
    } catch (error: any) {
      const msg = this.traducirError(error.code ?? '');
      await this.toast(msg, 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async toggleEstado(rep: Repartidor): Promise<void> {
    if (rep.activo) {
      await this.repartidorAuthService.desactivarRepartidor(rep.id!);
      await this.toast(`${rep.nombre} desactivado`, 'medium');
    } else {
      await this.repartidorAuthService.activarRepartidor(rep.id!);
      await this.toast(`${rep.nombre} activado`, 'success');
    }
  }

  async confirmarEliminar(rep: Repartidor): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar repartidor',
      message: `¿Eliminar a ${rep.nombre}? Solo se borra el registro, la cuenta de Firebase queda activa.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.repartidorAuthService.eliminarRepartidor(rep.id!);
            await this.toast('Repartidor eliminado', 'danger');
          }
        }
      ]
    });
    await alert.present();
  }

  private async toast(msg: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'top', color });
    await t.present();
  }

  private traducirError(code: string): string {
    const e: Record<string, string> = {
      'auth/email-already-in-use': 'Ese correo ya está registrado.',
      'auth/invalid-email': 'El correo no tiene un formato válido.',
      'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres).'
    };
    return e[code] ?? 'Error al crear el repartidor. Intenta de nuevo.';
  }
}
