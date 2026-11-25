const CACHE_PREFIX = 'sussy-clicker-cache-';
const CACHE_NAME = `${CACHE_PREFIX}v8`;
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './void-3002.html',
  './planet-worlds.css',
  './planet-worlds.js',
  './casino.html',
  './stocks.html',
  './team-manager.html',
  './team-data.js',
  './auto-update.js',
  './brainrot-theme.css',
  './data.js',
  './favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cache) => cache.startsWith(CACHE_PREFIX) && cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache))
      ))
      .then(() => self.clients.claim())
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
      .catch(() => caches.open(CACHE_NAME).then((cache) => cache.match(event.request)))
  );
});
