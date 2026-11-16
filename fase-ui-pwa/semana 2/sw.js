const CACHE_NAME = 'pwa-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './diagnostico.html',
    './icons/icon-192.png',
    './icons/icon-512.png',
    'https://code.jquery.com/jquery-3.6.0.min.js'
];

// Evento Instalación: Guarda recursos estáticos en Caché local
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Evento Activación: Limpia cachés de versiones anteriores
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Evento Fetch: Intercepta solicitudes HTTP y sirve desde Caché (Offline-First)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});
