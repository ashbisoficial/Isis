# Isis — Plan personal de estudios y día a día

App personal (PWA) para gestionar estudios, entrenamiento, alimentación,
hobbies, deberes y viajes desde un solo lugar, con un plan de estudio
personalizado generado automáticamente y recordatorios configurables.
Con cuenta propia (Firebase), los datos se sincronizan solos entre
celular, tablet y PC.

## Módulos

- **📚 Educación** — semestres, asignaturas, evaluaciones con ponderación,
  temario (marcando temas prioritarios), tareas y actividades. Incluye un
  **generador de plan de estudio personalizado** que distribuye el tiempo
  diario disponible entre asignaturas según la ponderación de las
  evaluaciones, la cercanía de la fecha y los temas marcados como
  prioritarios.
- **🏋️ Entrenamiento** — horarios y días de entrenamiento, rutina por día
  (ejercicios, series, repeticiones, peso) y registro de evolución
  corporal (peso, masa muscular, % grasa) con gráfico.
- **🥗 Alimentación** — horario de comidas de la semana y objetivos/notas
  nutricionales.
- **🎨 Hobbies** — lista personalizable de hobbies con día, horario y
  metas.
- **✅ Deberes** — checklist totalmente personalizable de deberes del
  hogar o externos, tachable, con recordatorios repetibles varias veces al
  día hasta marcarlos como hechos.
- **✈️ Viajes** — viajes con fechas, presupuesto, itinerario y lista de
  equipaje tachable.

Todo el contenido de cada módulo se puede configurar libremente con
recordatorios: cuántos días/semanas antes avisar, o cada cuántas horas
repetir el aviso hasta completar la tarea.

## Stack

- [Vite](https://vite.dev) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [react-router-dom](https://reactrouter.com) para la navegación
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) para que la app sea
  instalable (PWA)
- [Firebase Auth](https://firebase.google.com/docs/auth) (email/contraseña)
  + [Firestore](https://firebase.google.com/docs/firestore) para tener
  cuenta propia y sincronizar los datos entre celular, tablet y PC, con
  soporte offline (cache local en IndexedDB que sincroniza solo al volver
  la conexión).
- Si todavía no configuraste Firebase, la app sigue funcionando en modo
  local (`localStorage`, sin cuenta) — ver más abajo. Siempre se puede
  exportar/importar un backup en JSON desde **Ajustes**.

## App publicada

👉 **https://isis-asistente.web.app**

## Desarrollo

```bash
npm install
npm run dev
```

```bash
npm run build    # build de producción
npm run preview  # sirve el build para probarlo
```

## Configurar Firebase (cuenta + sincronización entre dispositivos)

Sin esto la app funciona igual, pero solo local en cada dispositivo (sin
login ni sincronización). Para activar cuentas:

1. Andá a la [consola de Firebase](https://console.firebase.google.com/) →
   **Agregar proyecto** → seguí los pasos (podés desactivar Google
   Analytics, no hace falta).
2. En el menú lateral: **Compilación → Authentication → Comenzar** →
   pestaña **Sign-in method** → habilitá el proveedor **Correo
   electrónico/contraseña**.
3. En el menú lateral: **Compilación → Firestore Database → Crear base de
   datos** → elegí una ubicación cercana → empezá en **modo de
   producción** (las reglas de seguridad ya están en `firestore.rules` en
   este repo).
4. Andá a **Reglas** dentro de Firestore Database y pegá el contenido de
   `firestore.rules` de este repo, reemplazando lo que haya. Publicá.
5. En **⚙️ Configuración del proyecto** (ícono de engranaje) → bajá hasta
   **Tus apps** → ícono **`</>`** (Web) → registrá una app (el nombre no
   importa) → copiá los valores de `firebaseConfig`.
6. En este proyecto: `cp .env.example .env` y completá cada
   `VITE_FIREBASE_*` con esos valores.
7. `npm run dev` (o volvé a hacer `npm run build`) — ahora la app pide
   crear cuenta/iniciar sesión y sincroniza sola.

Para usarla en Netlify/Vercel u otro hosting, cargá esas mismas variables
de entorno (`VITE_FIREBASE_*`) en la configuración del proyecto del
hosting — nunca las subas hardcodeadas al código ni al repo (el `.env`
real ya está en `.gitignore`).

## Desplegar (Firebase Hosting)

La app ya está publicada en Firebase Hosting. Para volver a desplegar
después de hacer cambios:

```bash
npm run build
npx firebase-tools deploy --only hosting --project isis-asistente
```

La primera vez pide loguearte (`npx firebase-tools login`) con la cuenta de
Google dueña del proyecto. La configuración de hosting vive en
`firebase.json` (sirve la carpeta `dist/`, con reescritura de rutas para
que funcione el routing de React) y `.firebaserc` (proyecto por defecto).

## Widget de pantalla de inicio y notificaciones — limitaciones actuales

Esta primera versión es una **app web (PWA)**. Los navegadores no permiten
que una PWA cree un widget nativo real de Android/iOS, ni programar
notificaciones que despierten el dispositivo con la app completamente
cerrada (eso requiere un backend con push notifications o una app nativa).

Como alternativa, mientras tanto:

- Hay una vista compacta en **`/widget`** pensada para consultar rápido
  los pendientes de hoy. Al instalar la app (PWA), queda disponible como
  acceso directo "Widget de hoy" manteniendo presionado el ícono instalado.
- Los recordatorios (notificaciones del navegador) se disparan mientras la
  app está abierta (o instalada y minimizada, según el sistema operativo),
  revisando cada minuto si hay algo que avisar.

**Fase 2 (pendiente, no incluida en esta versión):** empaquetar la app con
[Expo](https://expo.dev)/React Native para tener un widget nativo real de
pantalla de inicio y notificaciones push confiables en segundo plano.

## Estructura

```
src/
  lib/            tipos, generador del plan de estudio, motor de recordatorios, config de Firebase
  store/          contexto de auth (Firebase), contexto de datos (Firestore + cache local) y motor de notificaciones
  components/     UI compartida (botones, cards, editor de recordatorios, gráfico)
  modules/        una mini-app por categoría (Educación, Entrenamiento, etc.)
  routes/         Login, Home, Widget y Ajustes
```
