// Service Worker para RoundUp — instalabilidad mínima
// En futuro: agregar caching strategies y offline support

const CACHE_NAME = 'roundup-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Passthrough: no caché aún, todo de la red
self.addEventListener('fetch', () => {
  // Future: implementar caching strategies
});
