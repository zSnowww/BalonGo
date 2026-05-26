import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  mostrarPassword = false;
  cargando = false;
  errorMsg = '';
  modo: 'admin' | 'repartidor' = 'admin';

  async ingresar(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMsg = 'Por favor ingresa tu correo y contraseña.';
      return;
    }
    this.cargando = true;
    this.errorMsg = '';

    try {
      await this.authService.login(this.email.trim(), this.password);

      if (this.modo === 'repartidor') {
        // Verificar que es repartidor activo
        const db = getFirestore();
        const user = this.authService.currentUser;
        if (!user) throw new Error('No user');
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
      } else {
        await this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
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
    const errores: Record<string, string> = {
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/user-not-found': 'No existe una cuenta con ese correo.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/invalid-email': 'El formato del correo no es válido.',
      'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.'
    };
    return errores[code] ?? 'Error inesperado. Intenta de nuevo.';
  }
}