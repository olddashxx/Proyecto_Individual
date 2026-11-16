/* ============================================================================
   [FUNCIONALIDAD PWA OFFLINE-FIRST]: Service Worker de Bition S.R.L. (sw.js)
   Basado en la Guía Técnica: Arquitectura PWA Offline-First (UPDS Diseño Web II)
   - Cachea los recursos estáticos locales (HTML, CSS, JS, JSON e íconos SVG)
   - Intercepta peticiones HTTP mediante evento 'fetch' para funcionar sin red
   ============================================================================ */

const CACHE_NAME = 'bition-pwa-cache-v1';

// Lista de recursos esenciales de la aplicación que se guardan en Cache Storage
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './mobile.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './data/marcas.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './icons/logo-datamark.svg',
  './icons/logo-ia.svg',
  './icons/logo-ipmatic.svg',
  './icons/logo-gaceta.svg',
  './icons/logo-senapi.svg'
];

// 1. Evento Instalación (install): Abre la caché y almacena los archivos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Se intenta cachear jQuery externo sin bloquear la instalación si no hay red
      cache.add('https://code.jquery.com/jquery-3.7.1.min.js').catch(() => {
        console.log('[SW Bition] jQuery externo omitido en caché inicial.');
      });
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Evento Activación (activate): Limpia versiones antiguas de la caché
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );
  self.clients.claim();
});

// 3. Evento Fetch: Sirve desde Cache Storage primero y recurre a la red si no existe
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // Guardamos copia en caché si la respuesta es válida
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red y no estaba en caché, retornamos vista móvil si es navegación
          if (event.request.mode === 'navigate') {
            return caches.match('./mobile.html');
          }
        });
    })
  );
});
