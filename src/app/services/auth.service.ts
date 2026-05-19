import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth();
  private userSubject = new BehaviorSubject<User | null>(null);

  /** Observable del usuario autenticado */
  user$: Observable<User | null> = this.userSubject.asObservable();

  /** Usuario actual (síncrono) */
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  constructor(private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    await this.router.navigate(['/login'], { replaceUrl: true });
  }

  /** Devuelve true si hay sesión activa */
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  /** Espera a que Firebase Auth resuelva el estado inicial */
  waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(this.auth, (user) => {
        unsub();
        resolve(user);
      });
    });
  }
}
