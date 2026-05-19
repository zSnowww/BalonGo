import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton, IonIcon, LoadingController, AlertController } from '@ionic/angular/standalone';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton, IonIcon]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  email = '';
  password = '';
  mostrarPassword = false;

  async ingresar(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) {
      await this.mostrarError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Ingresando...' });
    await loading.present();

    try {
      await this.authService.login(this.email.trim(), this.password);
      await loading.dismiss();
      await this.router.navigate(['/dashboard'], { replaceUrl: true });
    } catch (error: any) {
      await loading.dismiss();
      const mensaje = this.traducirError(error.code);
      await this.mostrarError(mensaje);
    }
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  private async mostrarError(mensaje: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Error al iniciar sesión',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  private traducirError(code: string): string {
    const errores: Record<string, string> = {
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/user-not-found': 'No existe una cuenta con ese correo.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/invalid-email': 'El formato del correo no es válido.',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Espera unos minutos.'
    };
    return errores[code] ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}