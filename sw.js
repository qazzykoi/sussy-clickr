const CACHE_NAME = 'sussy-clicker-cache-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './casino.html',
  './stocks.html',
  './brainrot-theme.css',
  './data.js',
  './favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the new service worker to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Deletes old cached versions
          }
        })
      );
    }).then(() => self.clients.claim()) // Immediately updates open tabs
  );
});

// NETWORK-FIRST: Always tries to download your newest GitHub update first
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
          );
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
