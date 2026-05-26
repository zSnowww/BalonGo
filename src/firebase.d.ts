// Declaraciones de módulos Firebase para compatibilidad con moduleResolution: node + Firebase v12
// Firebase v12 usa el campo "exports" de package.json, que moduleResolution:node no sigue.
// Redirigimos a los paquetes @firebase/* donde están los tipos reales.

declare module 'firebase/auth' {
  export * from '@firebase/auth';
}

declare module 'firebase/firestore' {
  export * from '@firebase/firestore';
}

declare module 'firebase/app' {
  export * from '@firebase/app';
}

declare module 'firebase/storage' {
  export * from '@firebase/storage';
}

declare module 'firebase/analytics' {
  export * from '@firebase/analytics';
}
