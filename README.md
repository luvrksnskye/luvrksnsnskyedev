# Arquitectura del Portfolio Interactivo

## Visión General

Este proyecto es una Single-Page Application (SPA) construida con **JavaScript puro (Vanilla JS)**, siguiendo una filosofía de diseño altamente modular y organizada. La arquitectura está diseñada para ser escalable y mantenible, separando cada pieza de funcionalidad en su propio módulo autocontenido.

El sistema evita el uso de frameworks de gran tamaño como React o Vue, optando por un control preciso del DOM y del ciclo de vida de la aplicación a través de un sistema de módulos ES6 nativo.

---

## El Núcleo del Sistema (`core.js`)

El archivo `core.js` es el cerebro de la aplicación. Expone una instancia única (Singleton) de la clase `CoreManager`, que actúa como un orquestador central (Mediator) para todos los demás módulos.

Sus responsabilidades principales son:

1.  **Registro y Carga de Módulos:** Carga dinámicamente todos los módulos de funcionalidades (denominados "Managers") usando `import()` de forma asíncrona.
2.  **Inicialización por Fases:** Arranca los módulos en un orden estructurado para asegurar que las dependencias estén listas.
    -   **Fase 1 (Críticos):** Servicios esenciales como el sonido (`soundManager`).
    -   **Fase 2 (UI):** Controladores de interfaz como la navegación (`navigationManager`) y el modo oscuro (`darkModeManager`).
    -   **Fase 3 (Contenido):** Todos los módulos que gestionan el contenido de las diferentes secciones (`aboutManager`, `galleryManager`, etc.).
3.  **Mediación de Comunicación:** Actúa como intermediario para la comunicación entre módulos, evitando dependencias directas y enredos. Por ejemplo, se asegura de que el módulo de música (`musicManager`) y el de YouTube se pausen mutuamente para que no suenen a la vez.

## Sistema de Módulos

La arquitectura se basa en dos patrones principales: un orquestador de arranque y un conjunto de módulos especializados ("Managers").

### 1. Punto de Entrada (`index.js`)

Es el primer script que se ejecuta. Su única responsabilidad es orquestar el proceso de arranque de la aplicación de manera segura y eficiente.

-   **Pre-carga Prioritaria:** Inicia el `loaderManager` para la pantalla de carga inicial y se asegura de que todos los assets críticos estén disponibles.
-   **Carga Eager vs. Lazy:**
    -   Carga de forma inmediata `animations.js`, ya que es crucial para la secuencia de introducción.
    -   Espera a que la pre-carga finalice y entonces carga de forma diferida (`lazy loading`) el `core.js` para no bloquear el renderizado inicial.
-   **API Global:** Expone un objeto `window.app` que sirve como una API segura para depuración y acceso controlado a los diferentes módulos desde la consola del navegador.

### 2. El Patrón "Manager" (`*Manager.js`)

Cada funcionalidad principal del portfolio está encapsulada en su propio módulo, siguiendo el **Principio de Responsabilidad Única**.

-   **`animations.js`:** Un módulo de alta prioridad que gestiona la compleja secuencia de introducción por fases (`phase-voice`, `phase-data`, etc.) y las transiciones entre las páginas principales.
-   **`navigation.js`:** Gestiona la lógica de la barra de navegación, el estado activo de los enlaces y la visualización de las diferentes "pantallas" o secciones (`homeScreen`, `aboutScreen`, etc.).
-   **`soundManager.js`:** Controla la reproducción de todos los efectos de sonido y la música de ambiente, proporcionando una API centralizada para el audio.
-   **Módulos de Contenido:** Archivos como `galleryManager.js`, `toolsManager.js`, y `aboutManager.js` se encargan de obtener los datos correspondientes y generar dinámicamente el HTML para poblar sus respectivas secciones en el DOM.

### 3. Módulos de Mejora (`sv-enhanced.js`)

Algunas secciones, como la de "Work" (`sv-work-screen`), tienen una complejidad visual adicional. Para mantener el `workManager.js` enfocado en su lógica principal, se utiliza un módulo de "mejora".

-   `sv-enhanced.js` se "engancha" a `workManager.js` después de que este se carga.
-   Utiliza un patrón (similar a "Monkey Patching" o "Decorator") para extender las funciones originales del `workManager`. Por ejemplo, reemplaza la animación de texto estándar por una más elaborada y añade la lógica para el panel lateral expandible, sin modificar el código fuente del `workManager`.

---

## Flujo de Datos y Eventos

La comunicación entre módulos es desacoplada y se gestiona de dos maneras:

1.  **Mediación por el Core:** Cuando un módulo necesita una acción que afecta a otro, generalmente se lo pide al `CoreManager`. El `Core` entonces se encarga de llamar al módulo apropiado. Esto centraliza la lógica de la aplicación.
2.  **Eventos Personalizados (Custom Events):** Para notificaciones globales, como un cambio de tema (modo oscuro), el sistema despacha eventos a través del objeto `window`. Cualquier módulo interesado puede suscribirse a estos eventos (`window.addEventListener('themeChanged', ...)`) y reaccionar en consecuencia, sin necesidad de conocer quién originó el cambio.

---

## Proceso de Arranque (Bootstrapping)

El flujo de inicio de la aplicación es el siguiente:

1.  El `index.html` carga `src/index.js` como un módulo ES6.
2.  `index.js` arranca el `loaderManager` y espera el evento `preloadComplete`.
3.  Durante la espera, `animations.js` ya ha sido cargado en memoria.
4.  Una vez `preloadComplete` se dispara, `index.js` carga `core.js` de forma asíncrona.
5.  `core.js` es instanciado y su método `init()` se ejecuta.
6.  `CoreManager` importa dinámicamente y inicializa en fases todos los demás módulos "Manager".
7.  Finalmente, `index.js` le da la orden a `animationsManager` para que comience la secuencia de introducción.
8.  Al terminar la introducción, la sección principal de la página se hace visible y la aplicación está lista para la interacción del usuario.

Esta arquitectura garantiza un rendimiento óptimo, una mantenibilidad clara y una gran capacidad para extender el proyecto con nuevas funcionalidades de forma aislada y segura.