// Cache name with version - change version to refresh cache
const CACHE_NAME = 'ai-mentor-v1';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Fetch cached resources
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached file OR fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Don't cache API calls or other dynamic content
            if (!event.request.url.includes('/api/')) {
              return caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, fetchResponse.clone());
                  return fetchResponse;
                });
            }
            return fetchResponse;
          });
      })
  );
}); 