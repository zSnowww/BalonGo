import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav">
      <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Dashboard</span>
      </a>
      <a class="nav-item" routerLink="/pedidos" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
        </svg>
        <span>Pedidos</span>
      </a>
      <a class="nav-item" routerLink="/clientes" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>Clientes</span>
      </a>
      <a class="nav-item" routerLink="/productos" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <span>Productos</span>
      </a>
      <a class="nav-item" routerLink="/perfil" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Perfil</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--nav-height, 72px);
      background: white;
      display: flex;
      align-items: center;
      justify-content: space-around;
      border-top: 1px solid var(--border, #e2e8f0);
      box-shadow: 0 -4px 20px rgba(15,23,42,0.06);
      z-index: 500;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 8px 12px;
      color: var(--subtle, #94a3b8);
      text-decoration: none;
      transition: color 0.2s;
      flex: 1;

      svg {
        width: 22px;
        height: 22px;
        transition: stroke 0.2s;
      }

      span {
        font-size: 0.65rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      &.active {
        color: var(--primary, #02162f);

        svg {
          stroke: var(--accent, #3b6cf4);
        }

        span {
          color: var(--accent, #3b6cf4);
        }
      }
    }
  `]
})
export class NavBarComponent { }
