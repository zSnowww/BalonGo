import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user,
  User
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  /** Observable del usuario activo (null si no hay sesión) */
  currentUser$: Observable<User | null> = user(this.auth);

  /**
   * Inicia sesión con correo y contraseña.
   * Lanza un error si las credenciales son inválidas.
   */
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  /** Cierra la sesión activa */
  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  /** Devuelve el usuario activo en este momento (sincrónico) */
  get currentUser(): User | null {
    return this.auth.currentUser;
  }
}
