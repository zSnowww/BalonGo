import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import {
  mailOutline,
  lockClosedOutline,
  eyeOffOutline
} from 'ionicons/icons';

import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonIcon
  ]
})

export class LoginPage {
  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOffOutline
    });
  }
}