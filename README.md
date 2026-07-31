# Isis — Plan personal de estudios y día a día

App personal (PWA) para gestionar estudios, entrenamiento, alimentación,
hobbies, deberes y viajes desde un solo lugar, con un plan de estudio
personalizado generado automáticamente y recordatorios configurables.

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
- Todos los datos se guardan **solo en el dispositivo** (`localStorage`) —
  no hay backend ni cuenta. Se puede exportar/importar un backup en JSON
  desde **Ajustes**.

## Desarrollo

```bash
npm install
npm run dev
```

```bash
npm run build    # build de producción
npm run preview  # sirve el build para probarlo
```

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
  lib/            tipos, generador del plan de estudio, motor de recordatorios
  store/          contexto de datos (localStorage) y motor de notificaciones
  components/     UI compartida (botones, cards, editor de recordatorios, gráfico)
  modules/        una mini-app por categoría (Educación, Entrenamiento, etc.)
  routes/         Home, Widget y Ajustes
```
