import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent
  ]
})

export class PerfilPage {
  perfil = {
    nombre: 'Carlos Mendoza',
    rol: 'Administrador General',
    correo: 'carlos.mendoza@gastonsillo.com',
    telefono: '945 782 314',
    direccion: 'Lima, Perú'
  };
}