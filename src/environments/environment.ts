// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  firebase: {
    // ⚠️  REEMPLAZA ESTOS VALORES con los de tu proyecto Firebase:
    // 1. Ve a https://console.firebase.google.com
    // 2. Crea o selecciona tu proyecto
    // 3. Ve a Configuración del proyecto > Tus apps > Web app
    // 4. Copia los valores de firebaseConfig aquí
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_PROYECTO.firebaseapp.com',
    projectId: 'TU_PROYECTO_ID',
    storageBucket: 'TU_PROYECTO.appspot.com',
    messagingSenderId: 'TU_MESSAGING_SENDER_ID',
    appId: 'TU_APP_ID'
  }
};
