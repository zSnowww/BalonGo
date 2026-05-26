import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

@Component({
  selector: 'app-repartidor-login',
  templateUrl: './repartidor-login.page.html',
  styleUrls: ['./repartidor-login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent]
})
export class RepartidorLoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  mostrarPassword = false;
  cargando = false;
  errorMsg = '';

  async ingresar(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMsg = 'Ingresa tu correo y contraseña.';
      return;
    }
    this.cargando = true;
    this.errorMsg = '';

    try {
      await this.authService.login(this.email.trim(), this.password);
      const user = this.authService.currentUser;
      if (!user) throw new Error('No user');

      const db = getFirestore();
      const q = query(
        collection(db, 'repartidores'),
        where('uid', '==', user.uid),
        where('activo', '==', true)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        await this.authService.logout();
        this.errorMsg = 'No tienes acceso como repartidor.';
        return;
      }

      await this.router.navigate(['/repartidor'], { replaceUrl: true });
    } catch (error: any) {
      this.errorMsg = this.traducirError(error.code ?? '');
    } finally {
      this.cargando = false;
    }
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  private traducirError(code: string): string {
    const e: Record<string, string> = {
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.'
    };
    return e[code] ?? 'Error al ingresar. Intenta de nuevo.';
  }
}
